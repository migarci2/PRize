use anchor_lang::prelude::*;

pub mod state;
pub mod errors;
pub mod instructions;

use instructions::*;

declare_id!("N4tunukgDEgapkstYPKrZZLCAC59EapzrWq2d724yCp");

#[program]
pub mod prize {
    use super::*;

    /// Initialize the PRize program
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::handler(ctx)
    }

    /// Create a new bounty with escrowed funds
    pub fn create_bounty(
        ctx: Context<CreateBounty>,
        bounty_id: u64,
        reward_amount: u64,
        github_issue_url: String,
        repo_name: String,
        issue_number: u64,
    ) -> Result<()> {
        instructions::create_bounty::handler(
            ctx,
            bounty_id,
            reward_amount,
            github_issue_url,
            repo_name,
            issue_number,
        )
    }

    /// Assign a bounty to a contributor
    pub fn assign_bounty(ctx: Context<AssignBounty>) -> Result<()> {
        instructions::assign_bounty::handler(ctx)
    }

    /// Complete a bounty and release funds to recipient
    pub fn complete_bounty(ctx: Context<CompleteBounty>) -> Result<()> {
        instructions::complete_bounty::handler(ctx)
    }

    /// Cancel a bounty and refund creator
    pub fn cancel_bounty(ctx: Context<CancelBounty>) -> Result<()> {
        instructions::cancel_bounty::handler(ctx)
    }
}
