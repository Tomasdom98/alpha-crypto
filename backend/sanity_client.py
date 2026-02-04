import httpx
from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class SanityClient:
    def __init__(self, project_id: str, dataset: str = "production", api_version: str = "2024-01-01"):
        self.project_id = project_id
        self.dataset = dataset
        self.api_version = api_version
        self.base_url = f"https://{project_id}.api.sanity.io/v{api_version}/data/query/{dataset}"
    
    async def fetch(self, query: str, params: Optional[Dict[str, Any]] = None) -> Any:
        """Execute a GROQ query against Sanity"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    self.base_url,
                    params={
                        "query": query,
                        **(params or {})
                    },
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                return data.get("result", [])
            except Exception as e:
                logger.error(f"Sanity fetch error: {e}")
                raise

# Initialize Sanity client
sanity = SanityClient(project_id="bj6asnq3")

async def get_articles(category: Optional[str] = None) -> List[Dict]:
    """Fetch articles from Sanity"""
    if category and category != "all":
        query = f'*[_type == "article" && category == "{category}"] | order(publishedAt desc)'
    else:
        query = '*[_type == "article"] | order(publishedAt desc)'
    
    query += ''' {
        _id,
        title,
        "slug": slug.current,
        excerpt,
        content,
        category,
        premium,
        publishedAt
    }'''
    
    return await sanity.fetch(query)

async def get_article_by_slug(slug: str) -> Optional[Dict]:
    """Fetch single article by slug from Sanity"""
    query = f'''*[_type == "article" && slug.current == "{slug}"][0] {{
        _id,
        title,
        "slug": slug.current,
        excerpt,
        content,
        category,
        premium,
        publishedAt
    }}'''
    
    result = await sanity.fetch(query)
    return result if isinstance(result, dict) else None

async def get_airdrops(status: Optional[str] = None, difficulty: Optional[str] = None) -> List[Dict]:
    """Fetch airdrops from Sanity"""
    filters = []
    
    if status and status != "all":
        filters.append(f'status == "{status}"')
    
    if difficulty and difficulty != "all":
        filters.append(f'difficulty == "{difficulty}"')
    
    filter_string = f" && {' && '.join(filters)}" if filters else ""
    
    query = f'*[_type == "airdrop"{filter_string}] | order(deadline asc)'
    query += ''' {
        _id,
        projectName,
        description,
        steps,
        deadline,
        estimatedReward,
        difficulty,
        status,
        link,
        premium
    }'''
    
    return await sanity.fetch(query)

async def get_airdrop_by_id(airdrop_id: str) -> Optional[Dict]:
    """Fetch single airdrop by ID from Sanity"""
    query = f'''*[_type == "airdrop" && _id == "{airdrop_id}"][0] {{
        _id,
        projectName,
        description,
        steps,
        deadline,
        estimatedReward,
        difficulty,
        status,
        link,
        premium
    }}'''
    
    result = await sanity.fetch(query)
    return result if isinstance(result, dict) else None