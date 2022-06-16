import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Experiment } from "../target/types/experiment";
import * as bip39 from "bip39";
import * as bs58 from "bs58";

try {
  const dec = bs58.decode(
    "2jhTN9agXckRGfCKZS87W4J3MAzCnHA5vGrJkKJUib9KEoSmWWhWpmyUKgTrmdy97gSgiThNFnik2nU2KxTzGxhh"
  );

  console.log("Decoded private ", dec);

  // const convert = anchor.web3.Keypair.fromSecretKey(decoded);
  // console.log("Decode ", convert.publicKey.toBase58());
} catch (error) {
  console.log("Decoded Error ", error);
  // const k = anchor.web3.Keypair.generate();

  // const check = bs58.encode(k.secretKey);
}

// const mnemonic = bip39.generateMnemonic(256);
// console.log("Menominc", mnemonic);

describe("experiment", () => {
  // Configure the client to use the local cluster.
  // const provider = anchor.AnchorProvider.env();
  // anchor.setProvider(provider);
  // const cluster = anchor.web3.clusterApiUrl("devnet");
  // const connection = new anchor.web3.Connection(cluster);
  // const user = anchor.web3.Keypair.generate();
  // const walletName =
  // "[230,173,135,4,100,253,103,213,194,169,203,165,73,97,78,64,144,112,167,215,200,100,171,114,47,19,195,54,181,241,41,91,241,49,155,216,177,172,75,22,119,10,65,104,160,3,229,251,79,25,23,59,146,156,61,185,105,91,120,54,139,196,11,33]";
  // let modified = walletName.replace(/[\[\]']+/g, "");
  // // let modified = walletName.replace(/ /g, "");
  // let arr = modified.split(",");
  // let new_arr = arr.map((item) => Number(item));
  // let sec = Uint8Array.from(new_arr);
  // let generate_key = anchor.web3.Keypair.fromSecretKey(sec);
  // console.log("Secret_str", generate_key.publicKey.toBase58());
});
