use anchor_lang::prelude::*;

/// Global program configuration account
/// PDA derived from ["config"]
#[account]
pub struct ProgramConfig {
    /// Authority who can update config (admin)
    pub authority: Pubkey,
    /// Total number of bounties created
    pub bounty_count: u64,
    /// Bump seed for PDA derivation
    pub bump: u8,
}

impl ProgramConfig {
    /// Space required for ProgramConfig account
    /// Discriminator (8) + Pubkey (32) + u64 (8) + u8 (1)
    pub const LEN: usize = 8 + 32 + 8 + 1;
}

/// Individual bounty account
/// PDA derived from ["bounty", bounty_id]
#[account]
pub struct Bounty {
    /// Unique bounty ID
    pub id: u64,
    /// Bounty creator (maintainer)
    pub creator: Pubkey,
    /// Reward amount in lamports
    pub reward_amount: u64,
    /// Current status of the bounty
    pub status: BountyStatus,
    /// Assigned contributor (if any)
    pub assignee: Option<Pubkey>,
    /// GitHub issue URL (up to 200 chars)
    pub github_issue_url: String,
    /// Repository name (up to 100 chars)
    pub repo_name: String,
    /// Issue/PR number
    pub issue_number: u64,
    /// Creation timestamp
    pub created_at: i64,
    /// Completion timestamp (if completed)
    pub completed_at: Option<i64>,
    /// Bump seed for PDA derivation
    pub bump: u8,
}

impl Bounty {
    /// Maximum space for variable-length fields
    /// Discriminator (8) + id (8) + creator (32) + reward (8) + status (1+1) 
    /// + assignee (1+32) + github_url (4+200) + repo_name (4+100) 
    /// + issue_number (8) + created (8) + completed (1+8) + bump (1)
    pub const MAX_LEN: usize = 8 + 8 + 32 + 8 + 2 + 33 + 204 + 104 + 8 + 8 + 9 + 1;
}

/// Status of a bounty
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BountyStatus {
    /// Bounty is open and available
    Open,
    /// Bounty is assigned to a contributor
    InProgress,
    /// Bounty has been completed
    Completed,
    /// Bounty has been cancelled
    Cancelled,
}
