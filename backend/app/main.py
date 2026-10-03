from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, httpx, json
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(title='StudyMate API')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

class ChatRequest(BaseModel):
    message: str
    history: list = []
    mode: str = 'chat'

def fallback(message: str):
    m = message.lower()
    if any(x in m for x in ['solve','calculate','numerical','find']):
        actions=[('hint','Give me a hint'),('formula','Show formula'),('solve','Solve step-by-step'),('similar','Similar problem'),('pyq','Practice PYQs')]
        phase='practice'
    elif 'revision' in m or 'revise' in m:
        actions=[('quick','5-minute revision'),('flash','Flashcards'),('quiz','Quiz me'),('pyq','PYQs'),('mistakes','Common mistakes')]
        phase='revision'
    else:
        actions=[('simple','Explain simply'),('analogy','Use an analogy'),('example','Real-world example'),('quiz','Quiz me'),('pyq','Practice PYQs'),('web','Web sources'),('books','Books')]
        phase='understand'
    return {'answer':f'StudyMate is ready. I can help you learn: **{message}**','topic':'Detected topic','phase':phase,'actions':[{'id':i,'label':l} for i,l in actions]}

@app.get('/api/health')
def health():
    return {'status':'ok','provider':os.getenv('AI_PROVIDER','ollama_cloud'),'model':os.getenv('OLLAMA_MODEL','gpt-oss:120b')}

@app.post('/api/chat')
async def chat(req: ChatRequest):
    api_key=os.getenv('OLLAMA_API_KEY')
    model=os.getenv('OLLAMA_MODEL','gpt-oss:120b')
    host=os.getenv('OLLAMA_HOST','https://ollama.com').rstrip('/')
    if not api_key:
        return fallback(req.message)

    system='''You are StudyMate, a personalized academic tutor.\nReturn valid JSON only with keys: answer, topic, phase, actions.\nphase must be one of discover, understand, practice, revision, exam.\nactions must be an array of objects with id and label. Choose 4-8 actions that fit the exact request.\nPossible actions: simple, analogy, example, deeper, prerequisite, formula, hint, solve, similar, quiz, revision, flashcards, pyq, exam, web, books, ncert, related, mistakes.\nNever call AI-generated questions PYQs. PYQs must be verified separately.'''
    messages=[{'role':'system','content':system}]+req.history[-12:]+[{'role':'user','content':req.message}]
    try:
        async with httpx.AsyncClient(timeout=90) as client:
            r=await client.post(f'{host}/api/chat',headers={'Authorization':f'Bearer {api_key}','Content-Type':'application/json'},json={'model':model,'messages':messages,'stream':False})
            r.raise_for_status()
            content=r.json()['message']['content'].strip()
            if content.startswith('```'):
                content=content.replace('```json','',1).replace('```','',1).strip()
            try:
                return json.loads(content)
            except Exception:
                return {'answer':content,'topic':'General','phase':'understand','actions':[{'id':'simple','label':'Explain simply'},{'id':'quiz','label':'Quiz me'},{'id':'revision','label':'Revision'}]}
    except Exception as exc:
        print('Ollama Cloud error:',repr(exc))
        return fallback(req.message)
