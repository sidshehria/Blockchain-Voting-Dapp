import React, { useState } from 'react';

export default function Voting({ setScreen, vote, candidates }) {
    return (
        <div className="flex flex-col gap-4 items-center justify-center min-h-screen">
            <button className="absolute top-14 left-10 underline" onClick={() => setScreen('home')}>Back</button>
            <h1 className="text-4xl font-extrabold">Voting</h1>
            
            <div className="flex flex-col gap-4 items-center justify-center">
                {candidates.map((candidate) => {
                    return (
                        <div key={candidate.id} className="flex flex-col gap-4 items-center justify-center">
                            <img src={candidate.imageUri} alt="Candidate" className="w-40 h-40 rounded-full" />
                            <h1 className="text-2xl font-bold">{candidate.name}</h1>
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-xl font-semibold">
                                    Votes: {candidate.votes}
                                </div>
                                <button 
                                    onClick={() => vote(candidate.blockchainId)} 
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Vote
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}