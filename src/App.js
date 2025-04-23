import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useContract, useSigner } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./CONTRACT";

import AddCandidate from "./Components/AddCandidate";
import Voting from "./Components/Voting";

function App() {
	const [screen, setScreen] = useState('home')
	const [candidates, setCandidates] = useState(() => {
		// Load candidates from localStorage on initial load
		const savedCandidates = localStorage.getItem('candidates');
		return savedCandidates ? JSON.parse(savedCandidates) : [];
	})
	const [totalVotes, setTotalVotes] = useState(0)

	const { address } = useAccount()
	const { data: signer } = useSigner()
	const contract = useContract({
		address: CONTRACT_ADDRESS,
		abi: CONTRACT_ABI,
		signerOrProvider: signer
	})

	// Save candidates to localStorage whenever they change
	useEffect(() => {
		localStorage.setItem('candidates', JSON.stringify(candidates));
	}, [candidates]);

	const addCandidate = async(name, party, imageUri) => {
		try {
			// First add to blockchain
			const tx = await contract.addCandidate(name, party, imageUri);
			await tx.wait();
			console.log("Candidate added to blockchain");

			// Get the blockchain candidate count to use as ID
			const count = await contract.candidateCount();
			const blockchainId = count.toNumber();

			// Then update local state
			const newCandidate = {
				name,
				party,
				imageUri,
				id: Date.now(),
				blockchainId, // Store the blockchain ID
				votes: 0
			};
			setCandidates(prev => [...prev, newCandidate]);
			setScreen('home');
		} catch(err) {
			console.error("Error adding candidate:", err);
			alert("Failed to add candidate. Please check your wallet connection and try again.");
		}
	}

	const removeAllCandidates = () => {
		setCandidates([]);
	}

	const vote = async(candidateId) => {
		try {
			if (!address) {
				alert("Please connect your wallet first");
				return;
			}

			// First vote on blockchain
			// Note: candidateId is now the blockchain index (1-based)
			const tx = await contract.vote(candidateId);
			await tx.wait();
			console.log("Vote recorded on blockchain");

			// Then update local state
			setCandidates(prev => prev.map(candidate => {
				if (candidate.blockchainId === candidateId) {
					return { ...candidate, votes: candidate.votes + 1 };
				}
				return candidate;
			}));
		} catch(err) {
			console.error("Error voting:", err);
			alert("Failed to vote. Please check your wallet connection and try again.");
		}
	}

	const RenderScreen = () => {
		return (
			<div className="flex flex-col gap-4 items-center justify-center min-h-screen">
				{
					screen === 'addCandidate' ? (
						<AddCandidate setScreen={setScreen} addCandidate={addCandidate} />
					) : (
						<Voting setScreen={setScreen} vote={vote} candidates={candidates} />
					)
				}
			</div>
		)
	}

	return (
		<div className="bg-black text-white">
			<div className="flex items-center justify-between flex-row px-4 py-2">
				{/* Logo */}
				<h1 className="text-2xl font-bold">Election</h1>
				<ConnectButton />
			</div>
			{
				screen === 'home' ? (
					<div className="flex flex-col gap-4 items-center justify-center min-h-screen">
						<h1 className="text-4xl font-extrabold">Election</h1>
						{
							address ? (
								<div className="flex flex-row gap-4 items-center justify-center">
									<button onClick={() => setScreen('addCandidate')} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Add Candidate</button>
									<button onClick={removeAllCandidates} className="bg-red-500 text-white px-4 py-2 rounded-lg">Remove All Candidates</button>
									<button onClick={() => setScreen('vote')} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Vote</button>
								</div>
							) : (
								<ConnectButton />
							)
						}
					</div>
				) : (
					<RenderScreen />
				)
			}
		</div>
	);
}

export default App;