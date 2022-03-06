import * as anchor from "@project-serum/anchor";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { readFile } from "mz/fs";
import { TicTacToe } from "../../target/types/tic_tac_toe";
import { Program } from "@project-serum/anchor";

chai.use(chaiAsPromised);

const { expect } = chai;

async function play(
  program: Program<TicTacToe>,
  game,
  player,
  tile,
  expectedTurn,
  expectedGameState,
  expectedBoard
) {
  await program.rpc.play(tile, {
    accounts: {
      player: player.publicKey,
      game,
    },
    signers: player instanceof (anchor.Wallet as any) ? [] : [player],
  });

  const gamaState = await program.account.game.fetch(game);
  expect(gamaState.turn).to.equal(expectedTurn);
  expect(gamaState.state).to.eql(expectedGameState);
  expect(gamaState.board).to.eql(expectedBoard);
}
describe("", () => {
  const provider = anchor.Provider.local("http://127.0.0.1:8899");
  const { SystemProgram } = anchor.web3;
  anchor.setProvider(provider);

  const program = anchor.workspace.TicTacToe as Program<TicTacToe>;

  it("Setup game", async () => {
    const gameKeypair = anchor.web3.Keypair.generate();
    const playerOne = provider.wallet;
    const playerTwo = anchor.web3.Keypair.generate();
    await program.rpc.setupGame(playerTwo.publicKey, {
      accounts: {
        game: gameKeypair.publicKey,
        playerOne: playerOne.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [gameKeypair],
    });

    let gamaState = await program.account.game.fetch(gameKeypair.publicKey);
    expect(gamaState.turn).to.equal(1);
    expect(gamaState.players).to.eql([
      playerOne.publicKey,
      playerTwo.publicKey,
    ]);
    expect(gamaState.state).to.eql({ active: {} });
    expect(gamaState.board).to.eql([
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]);
  });

  it("player one wins!", async () => {
    const gameKeypair = anchor.web3.Keypair.generate();
    const playerOne = provider.wallet;
    const playerTwo = anchor.web3.Keypair.generate();
    await program.rpc.setupGame(playerTwo.publicKey, {
      accounts: {
        game: gameKeypair.publicKey,
        playerOne: playerOne.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [gameKeypair],
    });

    let gameState = await program.account.game.fetch(gameKeypair.publicKey);
    expect(gameState.turn).to.equal(1);
    expect(gameState.players).to.eql([
      playerOne.publicKey,
      playerTwo.publicKey,
    ]);
    expect(gameState.state).to.eql({ active: {} });
    expect(gameState.board).to.eql([
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]);

    await play(
      program,
      gameKeypair.publicKey,
      playerOne,
      { row: 0, colume: 0 },
      2,
      { active: {} },
      [
        [{ x: {} }, null, null],
        [null, null, null],
        [null, null, null],
      ]
    );

    try {
      await play(
        program,
        gameKeypair.publicKey,
        playerOne,
        { row: 1, column: 0 },
        2,
        { active: {} },
        [
          [{ x: {} }, null, null],
          [null, null, null],
          [null, null, null],
        ]
      );
      chai.assert(false, "should've failed but didn't");
    } catch (error) {
      expect(error.code).to.equal(6003);
    }

    await play(
      program,
      gameKeypair.publicKey,
      playerTwo,
      { row: 1, column: 0 },
      3,
      { active: {} },
      [
        [{ x: {} }, null, null],
        [{ o: {} }, null, null],
        [null, null, null],
      ]
    );

    await play(
      program,
      gameKeypair.publicKey,
      playerOne,
      { row: 0, column: 1 },
      4,
      { active: {} },
      [
        [{ x: {} }, { x: {} }, null],
        [{ o: {} }, null, null],
        [null, null, null],
      ]
    );

    await play(
      program,
      gameKeypair.publicKey,
      playerTwo,
      { row: 1, column: 1 },
      5,
      { active: {} },
      [
        [{ x: {} }, { x: {} }, null],
        [{ o: {} }, { o: {} }, null],
        [null, null, null],
      ]
    );

    try {
      await play(
        program,
        gameKeypair.publicKey,
        playerOne,
        { row: 0, column: 0 },
        5,
        { active: {} },
        [
          [{ x: {} }, { x: {} }, null],
          [{ o: {} }, { o: {} }, null],
          [null, null, null],
        ]
      );
      chai.assert(false, "should've failed but didn't ");
    } catch (error) {
      expect(error.code).to.equal(6001);
    }

    await play(
      program,
      gameKeypair.publicKey,
      playerOne,
      { row: 0, column: 2 },
      5,
      { won: { winner: playerOne.publicKey } },
      [
        [{ x: {} }, { x: {} }, { x: {} }],
        [{ o: {} }, { o: {} }, null],
        [null, null, null],
      ]
    );

    try {
      await play(
        program,
        gameKeypair.publicKey,
        playerOne,
        { row: 0, column: 2 },
        5,
        { won: { winner: playerOne.publicKey } },
        [
          [{ x: {} }, { x: {} }, { x: {} }],
          [{ o: {} }, { o: {} }, null],
          [null, null, null],
        ]
      );
      chai.assert(false, "should've failed but didn't ");
    } catch (error) {
      expect(error.code).to.equal(6002);
    }
  });
});
