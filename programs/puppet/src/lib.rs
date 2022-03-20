use anchor_lang::prelude::*;

declare_id!("5cb1avvJp6Xev5vp3p7bLxGY91UsSLNFwjYAmdSrQzEY");

#[program]
pub mod puppet {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, authority: Pubkey) -> Result<()> {
        let data = &mut ctx.accounts.puppet;
        data.authority = *ctx.accounts.user.key;
        Ok(())
    }

    pub fn set_data(ctx: Context<SetData>, data: u64) -> Result<()> {
        let ref mut puppet = ctx.accounts.puppet;
        puppet.data = data;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8 + 32)]
    pub puppet:Account<'info, Data>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// #[derive(Accounts)]
// pub struct SetData<'info> {
//     #[account(mut)]
//     pub puppet: Account<'info, Data>,
//     pub authority: Signer<'info>
// }


#[derive(Accounts)]
pub struct SetData<'info> {
    #[account(mut, has_one = authority)]
    pub puppet: Account<'info, Data>,
    pub authority: Signer<'info>
}


#[account] 
pub struct Data {
    pub data: u64,
    pub authority: Pubkey,
}