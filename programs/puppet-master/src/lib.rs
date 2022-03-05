use anchor_lang::prelude::*;
use puppet::cpi::accounts::SetData;
use puppet::program::Puppet;
use puppet::{self, Data};

declare_id!("7heuPnsQxZmQgEs96PcduTH5utWyXhiQkXRZtHWyTeD2");

#[program]
pub mod puppet_master {
    use super::*;
    pub fn pull_strings(ctx: Context<PullStrings>, data: u64) -> Result<()> {
        let cpi_program = ctx.accounts.puppet_program.to_account_info();
        let cpi_accounts = SetData {
            puppet: ctx.accounts.puppet.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        puppet::cpi::set_data(cpi_ctx, data)?;
        ctx.accounts.puppet.reload()?;
        if ctx.accounts.puppet.data != 1111 {
            panic!()
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct PullStrings<'info> {
    #[account(mut)]
    pub puppet: Account<'info, Data>,
    pub puppet_program: Program<'info, Puppet>,
}
