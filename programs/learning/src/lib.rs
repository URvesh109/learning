use anchor_lang::prelude::*;

declare_id!("AgSmLGJvPPhtg5g5C1bXBbwpJqDRW6SwXKKKBJjtqP9Z");

#[program]
pub mod learning {
    use super::*;
    pub fn intialize(ctx: Context<Initialize>, start: u64) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.authority = *ctx.accounts.authority.key;
        counter.count = start;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer=authority, space=8+40)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>

}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut, has_one = authority)]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>
}

#[account]
pub struct Counter {
    pub authority: Pubkey,
    pub count: u64
}