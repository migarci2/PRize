use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

/// Cancel a bounty and refund creator
#[derive(Accounts)]
pub struct CancelBounty<'info> {
    #[account(
        mut,
        seeds = [b"bounty", bounty.id.to_le_bytes().as_ref()],
        bump = bounty.bump,
        constraint = bounty.creator == creator.key() @ PrizeError::UnauthorizedAccess,
        constraint = bounty.status == BountyStatus::Open @ PrizeError::InvalidBountyStatus,
        close = creator
    )]
    pub bounty: Account<'info, Bounty>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

/// Cancel bounty instruction handler
pub fn handler(ctx: Context<CancelBounty>) -> Result<()> {
    let bounty = &ctx.accounts.bounty;
    let reward_amount = bounty.reward_amount;
    
    // Transfer escrowed funds back to creator
    **bounty.to_account_info().try_borrow_mut_lamports()? -= reward_amount;
    **ctx.accounts.creator.to_account_info().try_borrow_mut_lamports()? += reward_amount;
    
    msg!("Bounty {} cancelled. Reward of {} lamports refunded to creator", 
         bounty.id, reward_amount);
    
    // Note: bounty account is closed automatically via the close constraint
    // Rent exempt lamports are returned to creator
    
    Ok(())
}
