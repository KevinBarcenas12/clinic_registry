# import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import fastapi as _fastapi
from .Hooks import blockchain as _blockchain

from .Components import router

load_dotenv()
app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

blockchain = _blockchain.Blockchain()

# endpoint to mine a block
@app.post("/mine_block/")
def mine_block(data: str):
    if not blockchain.is_chain_valid():
        return _fastapi.HTTPException(
            status_code=400, detail="The blockchain is invalid"
        )
    block = blockchain.mine_block(data=data)

    return block

# endpoint to return the entire blockchain
@app.get("/blockchain/")
def get_blockchain():
    if not blockchain.is_chain_valid():
        return _fastapi.HTTPException(
            status_code=400, detail="The blockchain is invalid"
        )

    chain = blockchain.chain
    return chain

# endpoint returns the previous block
@app.get("/previous_block/")
def previous_block():
    if not blockchain.is_chain_valid():
        return _fastapi.HTTPException(
            status_code=400, detail="The blockchain is invalid"
        )
    return blockchain.get_previous_block    

# endpoint to see if the blockchain is valid
@app.get("/validate/")
def is_blockchain_valid():

    return blockchain.is_chain_valid()

app.include_router(router)
