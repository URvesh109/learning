import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
("@project-serum/anchor");
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";
import { PdaEg } from "../../target/types/pda_eg";

describe("game", async () => {
  const provider = anchor.Provider.local("http://127.0.0.1:8899");
  anchor.setProvider(provider);
  const program = anchor.workspace.PdaEg as Program<PdaEg>;
  it("sets and change name!", async () => {
    const [userStatsPDA, _] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("user-stats"),
        anchor.getProvider().wallet.publicKey.toBuffer(),
      ],
      program.programId
    );

    await program.rpc.createUserStats("brain", {
      accounts: {
        user: provider.wallet.publicKey,
        userStats: userStatsPDA,
        systemProgram: SystemProgram.programId,
      },
    });

    console.log("UserStats PDA ", userStatsPDA.toBase58());

    expect((await program.account.userStats.fetch(userStatsPDA)).name).to.equal(
      "brain"
    );

    const txId = await program.rpc.changeUserName("tom", {
      accounts: {
        user: provider.wallet.publicKey,
        userStats: userStatsPDA,
      },
    });

    console.log("Tx id ", txId);

    expect((await program.account.userStats.fetch(userStatsPDA)).name).to.eql(
      "tom"
    );
  });
});
