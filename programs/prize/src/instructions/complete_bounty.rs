use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

/// Complete a bounty and release funds
#[derive(Accounts)]
pub struct CompleteBounty<'info> {
    #[account(
        mut,
        seeds = [b"bounty", bounty.id.to_le_bytes().as_ref()],
        bump = bounty.bump,
        constraint = bounty.creator == creator.key() @ PrizeError::UnauthorizedAccess,
        constraint = bounty.status == BountyStatus::Open || bounty.status == BountyStatus::InProgress @ PrizeError::InvalidBountyStatus,
        close = creator
    )]
    pub bounty: Account<'info, Bounty>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    /// CHECK: Recipient of the bounty reward
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

/// Complete bounty instruction handler
pub fn handler(ctx: Context<CompleteBounty>) -> Result<()> {
    let bounty = &ctx.accounts.bounty;
    let clock = Clock::get()?;
    
    // Transfer escrowed funds to recipient
    let bounty_lamports = bounty.to_account_info().lamports();
    let reward_amount = bounty.reward_amount;
    
    // Calculate actual lamports to transfer (account rent will be reclaimed to creator via close)
    **bounty.to_account_info().try_borrow_mut_lamports()? -= reward_amount;
    **ctx.accounts.recipient.try_borrow_mut_lamports()? += reward_amount;
    
    msg!("Bounty {} completed. Reward of {} lamports transferred to {}", 
         bounty.id, reward_amount, ctx.accounts.recipient.key());
    
    // Note: bounty account is closed automatically via the close constraint
    // Rent exempt lamports are returned to creator
    
    Ok(())
}
