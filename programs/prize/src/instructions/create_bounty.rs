use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::state::*;
use crate::errors::*;

/// Create a new bounty
#[derive(Accounts)]
#[instruction(bounty_id: u64)]
pub struct CreateBounty<'info> {
    #[account(
        init,
        payer = creator,
        space = Bounty::MAX_LEN,
        seeds = [b"bounty", bounty_id.to_le_bytes().as_ref()],
        bump
    )]
    pub bounty: Account<'info, Bounty>,
    
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, ProgramConfig>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

/// Create bounty instruction handler
pub fn handler(
    ctx: Context<CreateBounty>,
    bounty_id: u64,
    reward_amount: u64,
    github_issue_url: String,
    repo_name: String,
    issue_number: u64,
) -> Result<()> {
    // Validate inputs
    require!(reward_amount > 0, PrizeError::InvalidAmount);
    require!(github_issue_url.len() <= 200, PrizeError::GithubUrlTooLong);
    require!(repo_name.len() <= 100, PrizeError::RepoNameTooLong);
    
    let bounty = &mut ctx.accounts.bounty;
    let config = &mut ctx.accounts.config;
    let clock = Clock::get()?;
    
    // Transfer SOL from creator to bounty PDA (escrow)
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        Transfer {
            from: ctx.accounts.creator.to_account_info(),
            to: bounty.to_account_info(),
        },
    );
    transfer(cpi_context, reward_amount)?;
    
    // Initialize bounty account
    bounty.id = bounty_id;
    bounty.creator = ctx.accounts.creator.key();
    bounty.reward_amount = reward_amount;
    bounty.status = BountyStatus::Open;
    bounty.assignee = None;
    bounty.github_issue_url = github_issue_url.clone();
    bounty.repo_name = repo_name;
    bounty.issue_number = issue_number;
    bounty.created_at = clock.unix_timestamp;
    bounty.completed_at = None;
    bounty.bump = ctx.bumps.bounty;
    
    // Increment global bounty counter
    config.bounty_count = config.bounty_count.checked_add(1).unwrap();
    
    msg!("Bounty created: ID={}, Reward={} lamports, Issue={}", 
         bounty_id, reward_amount, github_issue_url);
    
    Ok(())
}
