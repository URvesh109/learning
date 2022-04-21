import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";
import { FooMaster } from "../../target/types/foo_master";
import { Foo } from "../../target/types/foo";

describe("Can the program modify and sign for the account? Yes, Pda derived from the program's id, and whose owner is the program.", async () => {
  const provider = anchor.Provider.local("http://127.0.0.1:8899");
  anchor.setProvider(provider);
  const foo_program = anchor.workspace.Foo as Program<Foo>;
  const foo_master_program = anchor.workspace.FooMaster as Program<FooMaster>;
  const newFooAcc = new Keypair();

  it("FooMaster program sign for the foo account", async () => {
    const [fooMasterPDA, fooMasterBump] = await PublicKey.findProgramAddress(
      [],
      foo_master_program.programId
    );
    await foo_program.rpc.initialize({
      accounts: {
        foo: newFooAcc.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [newFooAcc],
    });

    // await foo_program.rpc.setData(new anchor.BN("007"), {
    //   accounts: {
    //     foo: newFooAcc.publicKey,
    //     signer: provider.wallet.publicKey,
    //   },
    // });

    await foo_master_program.rpc.pullStrings(
      fooMasterBump,
      new anchor.BN("007"),
      {
        accounts: {
          foo: newFooAcc.publicKey,
          fooProgram: foo_program.programId,
          authority: fooMasterPDA,
        },
      }
    );

    const foo_acc = await foo_program.account.data.fetch(newFooAcc.publicKey);
    assert.ok(foo_acc.data.eq(new anchor.BN("007")));
  });
});
