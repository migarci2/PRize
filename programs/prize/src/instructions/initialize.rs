use anchor_lang::prelude::*;
use crate::state::*;

/// Initialize the program's global configuration
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = ProgramConfig::LEN,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, ProgramConfig>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

/// Initialize instruction handler
pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    let config = &mut ctx.accounts.config;
    
    config.authority = ctx.accounts.authority.key();
    config.bounty_count = 0;
    config.bump = ctx.bumps.config;
    
    msg!("PRize program initialized by: {}", ctx.accounts.authority.key());
    
    Ok(())
}
