use anchor_lang::prelude::*;
use foo::cpi::accounts::SetData;
use foo::program::Foo;
use foo::{self, Data};

declare_id!("kGqRCrxhRZvmGQQQx1rmKBuV9EHS6w7FsA1FmSDRJdM");

#[program]
pub mod foo_master {
    use super::*;

    pub fn pull_strings(ctx: Context<PullStrings>, bump: u8, data: u64) -> Result<()> {
        let bump = &[bump][..];
        foo::cpi::set_data(
             ctx.accounts.set_data_ctx().with_signer(&[&[bump][..]]),
            data)
    }
}

#[derive(Accounts)]
pub struct PullStrings<'info> {
    pub foo: Account<'info, Data>,
    pub foo_program: Program<'info, Foo>,
    ///CHECK: only used as a signing PDA
    pub authority: UncheckedAccount<'info>
}


impl<'info> PullStrings<'info> {
    pub fn set_data_ctx(&self) -> CpiContext<'_, '_, '_, 'info, SetData<'info>> {
        let cpi_program = self.foo_program.to_account_info();
        let cpi_accounts = SetData {
            foo: self.foo.to_account_info(),
            signer: self.authority.to_account_info(),
        };

        CpiContext::new(cpi_program, cpi_accounts)
    }
}