use anchor_lang::prelude::*;

/// Custom error codes for the PRize program
#[error_code]
pub enum PrizeError {
    #[msg("Unauthorized: You do not have permission to perform this action")]
    UnauthorizedAccess,
    
    #[msg("Invalid bounty status for this operation")]
    InvalidBountyStatus,
    
    #[msg("Invalid amount: Amount must be greater than 0")]
    InvalidAmount,
    
    #[msg("Bounty not found")]
    BountyNotFound,
    
    #[msg("GitHub URL is too long (max 200 characters)")]
    GithubUrlTooLong,
    
    #[msg("Repository name is too long (max 100 characters)")]
    RepoNameTooLong,
    
    #[msg("Invalid assignee")]
    InvalidAssignee,
}
