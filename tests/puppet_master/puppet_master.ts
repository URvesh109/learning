import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Puppet } from "../../target/types/puppet";
import { PuppetMaster } from "../../target/types/puppet_master";
import { strict as assert } from "assert";

describe("puppet", () => {
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  const { SystemProgram } = anchor.web3;
  it("Perform CPI from puppet master to puppet", async () => {
    const puppet = anchor.workspace.Puppet as Program<Puppet>;
    const puppet_master = anchor.workspace
      .PuppetMaster as Program<PuppetMaster>;

    //create new puppet account
    const newPuppetAccount = anchor.web3.Keypair.generate();
    const tx = await puppet.rpc.initialize({
      accounts: {
        puppet: newPuppetAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [newPuppetAccount],
    });

    await puppet_master.rpc.pullStrings(new anchor.BN("1111"), {
      accounts: {
        puppet: newPuppetAccount.publicKey,
        puppetProgram: puppet.programId,
      },
    });
    const puppetAccount = await puppet.account.data.fetch(
      newPuppetAccount.publicKey
    );
    assert.ok(puppetAccount.data.eq(new anchor.BN("1111")));
  });
});
