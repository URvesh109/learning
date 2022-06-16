import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Experiment } from "../target/types/experiment";
import * as bip39 from "bip39";
import * as bs58 from "bs58";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

describe("experiment", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const myMne =
    "remind airport bind boil bike ivory mango ignore duty struggle glass trulyh";
  // const myMne1 =
  //   "fruit inhale female tank shark virus hub knee twin save helmet best";

  // const program = anchor.workspace.Experiment as Program<Experiment>;
  // const mnemonic = bip39.generateMnemonic(128);
  // const mnemonic = bip39.generateMnemonic(256);
  const seed = bip39.mnemonicToSeedSync(myMne, "");

  // const k = new anchor.web3.Keypair.fromSecretKey()
  const owner = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array([
      123, 245, 209, 55, 170, 200, 23, 142, 66, 252, 230, 196, 203, 49, 220,
      210, 212, 212, 2, 64, 208, 39, 226, 45, 64, 65, 82, 254, 70, 122, 90, 112,
      193, 73, 156, 182, 237, 70, 115, 65, 23, 251, 125, 84, 41, 36, 148, 198,
      166, 166, 40, 15, 26, 184, 134, 93, 139, 183, 162, 9, 201, 87, 143, 0,
    ])
  );

  // console.log("Public ", user.publicKey.toBase58());

  // const decoded = bs58.decode(
  //   "4Lu1ERqQToQv9MEhsaQCaMfnk5mc28jYgiXwBU8jtK6PKFfztfaqDxpdzkSADATrPaot5HQuy4QRC3HGfb1znUeH"
  // );

  // console.log("decoded  ", decoded);
  const user_fake = anchor.web3.Keypair.generate();

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

  // it("Is Signer is correct!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods
  //     .validate()
  //     .accounts({
  //       user: user.publicKey,
  //       authKey: provider.wallet.publicKey,
  //     })
  //     .rpc();
  //   console.log("Your transaction signature", tx);
  // });

  // it("Fake signer", async () => {
  //   // Add your test here.
  //   const fakeId = anchor.web3.Keypair.generate();
  //   try {
  //     const tx = await program.methods
  //       .validate()
  //       .accounts({
  //         user: user.publicKey,
  //         authKey: fakeId.publicKey,
  //       })
  //       .signers([fakeId])
  //       .rpc();
  //     console.log("Your transaction signature", tx);
  //   } catch ({ error }) {
  //     console.log("Error ", error.errorMessage);
  //   }
  // });
});
