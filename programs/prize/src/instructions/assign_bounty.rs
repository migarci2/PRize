use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

/// Assign a bounty to a contributor
#[derive(Accounts)]
pub struct AssignBounty<'info> {
    #[account(
        mut,
        seeds = [b"bounty", bounty.id.to_le_bytes().as_ref()],
        bump = bounty.bump,
        constraint = bounty.creator == creator.key() @ PrizeError::UnauthorizedAccess,
        constraint = bounty.status == BountyStatus::Open @ PrizeError::InvalidBountyStatus
    )]
    pub bounty: Account<'info, Bounty>,
    
    pub creator: Signer<'info>,
    
    /// CHECK: This is the contributor being assigned - no need to be a signer
    pub assignee: AccountInfo<'info>,
}

/// Assign bounty instruction handler
pub fn handler(ctx: Context<AssignBounty>) -> Result<()> {
    let bounty = &mut ctx.accounts.bounty;
    
    bounty.assignee = Some(ctx.accounts.assignee.key());
    bounty.status = BountyStatus::InProgress;
    
    msg!("Bounty {} assigned to {}", bounty.id, ctx.accounts.assignee.key());
    
    Ok(())
}
