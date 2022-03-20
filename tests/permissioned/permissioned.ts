import * as anchor from "@project-serum/anchor";
import { Program, web3 } from "@project-serum/anchor";
import { Permissioned } from "../../target/types/permissioned";
import { strict as assert } from "assert";
import { readFile } from "mz/fs";

const { PublicKey } = web3;
const candyMachinPublicKey = new PublicKey(
  "BKS64Ki5cZKS8NAt3UGGhjRPUcAnJFzo6hVsctu6pSLp"
);
const alpha1 = new PublicKey("3hdDjiUMHiRMkv6WonJz1q7yUJDGU2otEciFaN7ziwhZ");
const alpha2 = "Abyyn8FSbZ2mKqcXXkqhZnn6vNujSGyitbTxaDscV1Rz";
const fakeAlpha = "FFfewk4vRa3FYhAmYhFj24qGGjat38yJwjARjK2h7bvU";

describe("permissioned", async () => {
  const provider = anchor.Provider.local("http://127.0.0.1:8899");
  const { SystemProgram } = anchor.web3;
  anchor.setProvider(provider);

  const permissionedAcc = anchor.web3.Keypair.generate();
  let user2 = anchor.web3.Keypair.generate();
  let user3 = anchor.web3.Keypair.generate();
  let user4 = anchor.web3.Keypair.generate();
  const program = anchor.workspace.Permissioned as Program<Permissioned>;
  let tempPda;
  try {
    const [pda, _] = await anchor.web3.PublicKey.findProgramAddress(
      [
        alpha1.toBuffer(),
        candyMachinPublicKey.toBuffer(),
        user2.publicKey.toBuffer(),
      ],
      program.programId
    );
    tempPda = pda;
    console.log("My Pda is ", pda.toBase58());
  } catch (error) {
    console.log("Error ", error);
  }

  it("Create a users", async () => {
    await program.rpc.initialize({
      accounts: {
        users: permissionedAcc.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [permissionedAcc],
    });
  });

  it("Add new user 2", async () => {
    await program.rpc.addUserToList(user2.publicKey, {
      accounts: {
        users: permissionedAcc.publicKey,
        signer: user2.publicKey,
      },
      signers: [user2],
    });
  });

  it("Add new user 4", async () => {
    const txid = await program.rpc.addUserToList(user2.publicKey, {
      accounts: {
        users: permissionedAcc.publicKey,
        signer: tempPda,
      },
      // signers: [user4],
    });

    console.log("TxId ", txid);
  });

  it("Add new user 3", async () => {
    await program.rpc.addUserToList(user3.publicKey, {
      accounts: {
        users: permissionedAcc.publicKey,
        signer: user3.publicKey,
      },
      signers: [user3],
    });
    let permiAcc = await program.account.users.fetch(permissionedAcc.publicKey);

    permiAcc.authorites.forEach((pubKey) => {
      console.log("Pubkey is ", pubKey.toBase58());
    });
  });
});
