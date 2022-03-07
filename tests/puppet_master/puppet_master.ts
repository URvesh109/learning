import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Puppet } from "../../target/types/puppet";
import { PuppetMaster } from "../../target/types/puppet_master";
import { strict as assert } from "assert";
import { Keypair, SystemProgram, PublicKey } from "@solana/web3.js";

describe("puppet", () => {
  const provider = anchor.Provider.local("http://127.0.0.1:8899");
  anchor.setProvider(provider);
  const { SystemProgram } = anchor.web3;
  const puppet = anchor.workspace.Puppet as Program<Puppet>;
  const puppet_master = anchor.workspace.PuppetMaster as Program<PuppetMaster>;
  const newPuppetAccount = anchor.web3.Keypair.generate();

  it("Perform CPI from puppet master to puppet", async () => {
    const [puppetMasterPDA, puppetMasterBump] =
      await PublicKey.findProgramAddress([], puppet_master.programId);

    let useLess = Keypair.generate();

    console.log("PuppetMasterPDA", puppetMasterPDA.toBase58());

    //create new puppet account
    const tx = await puppet.rpc.initialize(useLess.publicKey, {
      accounts: {
        puppet: newPuppetAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [newPuppetAccount],
    });

    await puppet_master.rpc.pullStrings(
      puppetMasterBump,
      new anchor.BN("1111"),
      {
        accounts: {
          puppet: newPuppetAccount.publicKey,
          puppetProgram: puppet.programId,
          authority: puppetMasterPDA, // it will work
          // authority: provider.wallet.publicKey, // it will work
          // authority: useLess.publicKey, // it won't work
        },
      }
    );
    const puppetAccount = await puppet.account.data.fetch(
      newPuppetAccount.publicKey
    );
    assert.ok(puppetAccount.data.eq(new anchor.BN("1111")));
  });
});
