import React from 'react';
import '../styles/Vote.css';

const Vote = () => {
	return (
		<div>
			<div className='election-header'>
				<h1 className='election'>Elections</h1>
				<h1>0xxx...xxff</h1>
			</div>
			<hr />

			<div>
				<div className='election-details'>
					<div className='details-left'>
						<h2>Election Title</h2>
						<input type='text' />
						<h3>Upload Students</h3>
					</div>

					<div className='details-right'>
						<h3>Number of Voters: </h3>
						<h3>Contestants</h3>
					</div>
				</div>
				<hr />
				<div className='election-btn'>
					<button>Start Voting</button>
					<button>Submit Vote</button>
					<button>Make result public</button>
				</div>
			</div>
			{/* <div className='status'>
				<h2>Election Status</h2>
				<hr />
				<div>
					<h3>Name of Election</h3>
					<h3>Status of Election</h3>
					<h3>Election Date</h3>
					<hr />
				</div>
			</div>
			<div className='session'>
				<button>Start Voting Session</button>
				<button>End Proposal Session</button>
			</div>
			<div className='voting'>
				<input type='text' />
				<button>Add Voter</button>
			</div>
			<button>Prev</button>
			<button>Next</button> */}
		</div>
	);
};

export default Vote;
