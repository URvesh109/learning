use anchor_lang::prelude::*;

declare_id!("ADMMp4aPLZsrjbiv7NSMNrquDofnnm6Dh3ra6dRoB5nA");

#[program]
pub mod permissioned {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let users = &mut ctx.accounts.users;
        users.authorites.push(*ctx.accounts.authority.key);
        Ok(())
    }

    pub fn add_user_to_list(ctx: Context<AddUser>, user: Pubkey) -> Result<()> {
        let add_user = &mut ctx.accounts.users;
        add_user.authorites.push(*ctx.accounts.signer.key);
        Ok(())
    }

}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8+32*5)]
    pub users: Account<'info, Users>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct AddUser<'info> {
    #[account(mut)]
    pub users: Account<'info, Users>,
    pub signer: Signer<'info>
}

#[account]
pub struct Users {
    pub authorites: Vec<Pubkey>,
}