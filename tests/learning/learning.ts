import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Learning } from "../../target/types/learning";
import { strict as assert } from "assert";
import { readFile } from "mz/fs";
import {
  Connection,
  sendAndConfirmTransaction,
  clusterApiUrl,
  Transaction,
  Keypair,
} from "@solana/web3.js";

describe("learning", () => {
  // Configure the client to use the local cluster.

  const provider = anchor.Provider.local("http://127.0.0.1:8899");
  const { SystemProgram } = anchor.web3;

  anchor.setProvider(provider);

  const counter = anchor.web3.Keypair.generate();

  const program = anchor.workspace.Learning as Program<Learning>;

  it("Create a counter", async () => {
    await program.rpc.intialize(new anchor.BN(42), {
      accounts: {
        counter: counter.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [counter],
    });
    let counterAccount = await program.account.counter.fetch(counter.publicKey);
    assert.ok(counterAccount.count.eq(new anchor.BN(42)));
  });

  it("update ac counter", async () => {
    await program.rpc.increment({
      accounts: {
        counter: counter.publicKey,
        authority: provider.wallet.publicKey,
      },
    });

    const counterAccount = await program.account.counter.fetch(
      counter.publicKey
    );
    assert.ok(counterAccount.authority.equals(provider.wallet.publicKey));
    assert.ok(counterAccount.count.toNumber() == 43);
  });

  // it("Increment and check state!", async () => {
  //   // Add your test here.
  //   const idl = await anchor.Program.fetchIdl(program.programId.toBase58());

  //   const tmp = new anchor.Program(idl, program.programId.toBase58());

  //   let secretKey = await readFile("learningKeypair.json", {
  //     encoding: "utf8",
  //   });
  //   secretKey = Uint8Array.from(JSON.parse(secretKey));

  //   const signers = Keypair.fromSecretKey(secretKey);

  //   const increment = await tmp.instruction.increment({
  //     accounts: {
  //       counter: counter.publicKey,
  //       authority: provider.wallet.publicKey,
  //     },
  //   });

  //   const trans = new Transaction().add(increment);

  //   const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  //   const tx = await sendAndConfirmTransaction(connection, trans, [signers]);
  //   console.log("Increment ");
  //   const state: any = await program.account.counter.fetch(
  //     counter.publicKey.toBase58()
  //   );

  //   console.log("state ", state.count.toNumber());
  // });
});
