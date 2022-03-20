import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Puppet } from "../../target/types/puppet";
import { PuppetMaster } from "../../target/types/puppet_master";
import { strict as assert } from "assert";
import { Keypair, SystemProgram, PublicKey, Connection } from "@solana/web3.js";

describe("puppet", () => {
  let newSigners = new Keypair();
  const connection = new Connection("http://127.0.0.1:8899/");

  let wallet = new anchor.Wallet(newSigners);

  const provider = new anchor.Provider(connection, wallet, {
    preflightCommitment: "processed",
  });
  anchor.setProvider(provider);
  const puppet = anchor.workspace.Puppet as Program<Puppet>;
  const puppet_master = anchor.workspace.PuppetMaster as Program<PuppetMaster>;
  const newPuppetAccount = new Keypair();

  it("Perform CPI from puppet master to puppet", async () => {
    const [puppetMasterPDA, puppetMasterBump] =
      await PublicKey.findProgramAddress([], puppet_master.programId);

    const sig = await connection.requestAirdrop(newSigners.publicKey, 1e9);

    await connection.confirmTransaction(sig);
    const bal = await connection.getBalance(newSigners.publicKey);
    //create new puppet account
    const tx = await puppet.rpc.initialize(newSigners.publicKey, {
      accounts: {
        puppet: newPuppetAccount.publicKey,
        user: newSigners.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [newPuppetAccount],
    });

    // const txId = await puppet.rpc.setData(new anchor.BN("1111"), {
    //   accounts: {
    //     puppet: newPuppetAccount.publicKey,
    //     authority: newSigners.publicKey,
    //   },
    // });

    // let random_signer = new Keypair();

    // let new_wallet = new anchor.Wallet(random_signer);

    // let new_provider = new anchor.Provider(connection, new_wallet, {
    //   preflightCommitment: "processed",
    // });
    // anchor.setProvider(new_provider);
    // const new_puppet_instance = anchor.workspace.Puppet as Program<Puppet>;
    // const new_request = await connection.requestAirdrop(
    //   new_wallet.publicKey,
    //   1e9
    // );
    // await connection.confirmTransaction(new_request);

    // const txId = await new_puppet_instance.rpc.setData(new anchor.BN("1111"), {
    //   accounts: {
    //     puppet: newPuppetAccount.publicKey,
    //     authority: new_wallet.publicKey,
    //   },
    //   signers: [new_wallet.payer],
    // });

    // console.log("newSigners is ", newSigners.publicKey.toBase58());
    // console.log("new_wallet is ", new_wallet.publicKey.toBase58());

    await puppet_master.rpc.pullStrings(
      puppetMasterBump,
      new anchor.BN("1111"),
      {
        // await puppet_master.rpc.pullStrings(fakeBump, new anchor.BN("1111"), { // it will work
        accounts: {
          puppet: newPuppetAccount.publicKey,
          puppetProgram: puppet.programId,
          authority: puppetMasterPDA, // it will not work has_one constrait was violated
          // authority: newSigners.publicKey, // it is  working
        },
      }
    );

    const puppetAccount = await puppet.account.data.fetch(
      newPuppetAccount.publicKey
    );
    assert.ok(puppetAccount.data.eq(new anchor.BN("1111")));
  });
});
