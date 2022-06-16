import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Experiment } from "../target/types/experiment";
import * as bip39 from "bip39";
import * as bs58 from "bs58";

describe("experiment", () => {
  // Configure the client to use the local cluster.
  // const provider = anchor.AnchorProvider.env();
  // anchor.setProvider(provider);

  const decoded = bs58.decode(
    "4Lu1ERqQToQv9MEhsaQCaMfnk5mc28jYgiXwBU8jtK6PKFfztfaqDxpdzkSADATrPaot5HQuy4QRC3HGfb1znUeH"
  );

  const cluster = anchor.web3.clusterApiUrl("devnet");

  const connection = new anchor.web3.Connection(cluster);
  const user = anchor.web3.Keypair.generate();
  const user_fake = anchor.web3.Keypair.generate();
  const payer = anchor.web3.Keypair.fromSecretKey(decoded);
  let wallet = new anchor.Wallet(payer);

  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "processed",
  });

  anchor.setProvider(provider);
  const program = anchor.workspace.Experiment as Program<Experiment>;

  // connection.onAccountChange(wallet.publicKey, (accInfo, context) => {
  //   console.log("AccInto", accInfo.lamports);
  // });

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .initialize()
      .accounts({
        user: user.publicKey,
        signer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("Simulate", async () => {
    // Add your test here.
    let trans = await program.methods
      .initialize()
      .accounts({
        user: user_fake.publicKey,
        signer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      // .simulate({ maxRetries: 3 });
      .transaction();
    // .rpc();

    let keyArr = [user_fake, payer];

    let blockhash = await (
      await connection.getLatestBlockhash("finalized")
    ).blockhash;
    trans.feePayer = payer.publicKey;
    trans.recentBlockhash = blockhash;
    trans.sign(...keyArr);
    trans = await wallet.signTransaction(trans);
    const t = trans.serialize();
    const strTrans = t.toString("base64");

    const bal = await connection.simulateTransaction(trans, [], true);
    bal.value.accounts.forEach((value) => {
      console.log("Value ", value.lamports);
    });

    const txId = await connection.sendEncodedTransaction(strTrans);
    console.log("Bal", txId);
  });

  // it("Simulate", async () => {
  //   // Add your test here.
  //   const trans = await program.methods
  //     .validate()
  //     .accounts({
  //       user: user.publicKey,
  //       authKey: payer.publicKey,
  //     })
  //     .transaction();

  //   let blockhash = await (
  //     await connection.getLatestBlockhash("finalized")
  //   ).blockhash;
  //   trans.feePayer = payer.publicKey;
  //   trans.recentBlockhash = blockhash;
  //   // .simulate();
  //   const fee = await trans.getEstimatedFee(connection);
  //   console.log("Your transaction signature", fee);
  // });

  // it("Sign transaction", async () => {
  //   // Add your test here.
  //   try {
  //     const inst = await program.methods
  //       .validate()
  //       .accounts({
  //         user: user.publicKey,
  //         authKey: payer.publicKey,
  //       })
  //       .instruction();

  //     let blockhash = await (
  //       await connection.getLatestBlockhash("finalized")
  //     ).blockhash;

  //     let trans = new anchor.web3.Transaction();
  //     trans.recentBlockhash = blockhash;
  //     trans.feePayer = wallet.publicKey;
  //     trans.add(inst);

  //     // const txId = await wallet.signTransaction(trans);
  //     const fees = await trans.getEstimatedFee(connection);
  //     console.log("Fees ", fees);
  //     const id = await connection.sendTransaction(trans, [payer]);
  //     console.log("Id ", id);
  //     const txId = await connection.confirmTransaction(id, "processed");
  //     console.log("signTransaction", txId);
  //   } catch (error) {
  //     console.log("Error ", error);
  //   }
  // });
});
