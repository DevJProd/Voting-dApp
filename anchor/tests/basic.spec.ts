import { BankrunProvider } from "anchor-bankrun";
import {  startAnchor } from "solana-bankrun";
import { Keypair, PublicKey } from "@solana/web3.js";
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Voting } from '../target/types/voting';
import { describe, it, beforeAll } from '@jest/globals';
import { expect } from 'expect';
import { Provider } from "jotai";
import exp from "constants";
import { experimental_useEffectEvent } from "react";
const IDL = require('../target/idl/voting.json')

const votingAddress = new PublicKey('6z68wfurCMYkZG51s1Et9BJEd9nJGUusjHXNt4dGbNNF'); // Add the address of the deployed program here

describe('Voting', () => {

  let context;
  let provider;
  let votingProgram: anchor.Program<Voting>;


  beforeAll( async () => {
    context = await startAnchor("", [{name: "voting", programId: votingAddress }], []);
    provider = new BankrunProvider(context);

    votingProgram = new Program<Voting>(
      IDL,
      provider,
    );

  });

  it('Initialize Poll', async () => {
    context = await startAnchor("", [{name: "voting", programId: votingAddress }], []);
	  provider = new BankrunProvider(context);

    votingProgram = new Program<Voting>(
      IDL,
      provider,
    );

    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "what is your vote?",
      new anchor.BN(0),
      new anchor.BN(1821246480),
    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress);
    console.log(poll);

      expect(poll.pollId.toNumber()).toEqual(1);
      expect(poll.description).toEqual("what is your vote?");
      expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  });

  it("initialize candidate", async () => {
    await votingProgram.methods.initializeCandidate(
      "Trumpo",
      new anchor.BN(1),
    ).rpc();

    await votingProgram.methods.initializeCandidate(
      "Bidon",
      new anchor.BN(1),
    ).rpc();

    const [candidateAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Trumpo")],
      votingAddress
    )

    const trumpVote = await votingProgram.account.candidate.fetch(candidateAddress);
    console.log(trumpVote);
    expect(trumpVote.candidateVotes.toNumber()).toEqual(0);

    const [candidateAddress_2] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Bidon")],
      votingAddress
    )

    const bidonVote = await votingProgram.account.candidate.fetch(candidateAddress_2);
    console.log(bidonVote);
    expect(bidonVote.candidateVotes.toNumber()).toEqual(0);
  });

  it("vote", async () => {
    await votingProgram.methods.vote(
      "Trumpo",
      new anchor.BN(1),
    ).rpc();

    const [candidateAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Trumpo")],
      votingAddress
    )
    const trumpVote = await votingProgram.account.candidate.fetch(candidateAddress);
    console.log(trumpVote);
    expect(trumpVote.candidateVotes.toNumber()).toEqual(1);

  });

});
