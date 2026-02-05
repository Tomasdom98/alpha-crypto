import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
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
sanity = SanityClient(project_id="15c5x8s5")

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
        publishedAt,
        imageUrl
    }'''
    
    articles = await sanity.fetch(query)
    
    # Transform Sanity data to match our API format
    transformed = []
    for article in articles:
        transformed.append({
            "id": article.get("_id", ""),
            "title": article.get("title", ""),
            "slug": article.get("slug", ""),
            "excerpt": article.get("excerpt", ""),
            "content": article.get("content", "") or "Content coming soon...",
            "category": article.get("category", ""),
            "premium": article.get("premium", False),
            "published_at": article.get("publishedAt") or datetime.now(timezone.utc).isoformat(),
            "image_url": article.get("imageUrl", "") or "https://images.unsplash.com/photo-1651054558996-03455fe2702f?w=800"
        })
    
    return transformed

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
        publishedAt,
        imageUrl
    }}'''
    
    result = await sanity.fetch(query)
    
    if not result or (isinstance(result, list) and len(result) == 0):
        return None
    
    # Handle if result is a list with one item
    article = result[0] if isinstance(result, list) else result
    
    # Transform to match API format
    return {
        "id": article.get("_id", ""),
        "title": article.get("title", ""),
        "slug": article.get("slug", ""),
        "excerpt": article.get("excerpt", ""),
        "content": article.get("content", "") or "Content coming soon...",
        "category": article.get("category", ""),
        "premium": article.get("premium", False),
        "published_at": article.get("publishedAt") or datetime.now(timezone.utc).isoformat(),
        "image_url": article.get("imageUrl", "") or "https://images.unsplash.com/photo-1651054558996-03455fe2702f?w=800"
    }

async def get_article_by_id(article_id: str) -> Optional[Dict]:
    """Fetch single article by ID from Sanity"""
    query = f'''*[_type == "article" && _id == "{article_id}"][0] {{
        _id,
        title,
        "slug": slug.current,
        excerpt,
        content,
        category,
        premium,
        publishedAt,
        imageUrl
    }}'''
    
    result = await sanity.fetch(query)
    
    if not result or (isinstance(result, list) and len(result) == 0):
        return None
    
    article = result[0] if isinstance(result, list) else result
    
    return {
        "id": article.get("_id", ""),
        "title": article.get("title", ""),
        "slug": article.get("slug", ""),
        "excerpt": article.get("excerpt", ""),
        "content": article.get("content", "") or "Content coming soon...",
        "category": article.get("category", ""),
        "premium": article.get("premium", False),
        "published_at": article.get("publishedAt") or datetime.now(timezone.utc).isoformat(),
        "image_url": article.get("imageUrl", "") or "https://images.unsplash.com/photo-1651054558996-03455fe2702f?w=800"
    }

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
        logoUrl,
        description,
        fullDescription,
        backing,
        chain,
        timeline,
        rewardNote,
        steps,
        deadline,
        estimatedReward,
        difficulty,
        status,
        link,
        premium
    }'''
    
    airdrops = await sanity.fetch(query)
    
    # Transform to match API format
    transformed = []
    for airdrop in airdrops:
        # Transform steps to tasks format
        steps = airdrop.get("steps", []) or []
        tasks = []
        for i, step in enumerate(steps):
            if isinstance(step, dict):
                tasks.append({
                    "id": step.get("id", f"t{i+1}"),
                    "description": step.get("description", ""),
                    "completed": step.get("completed", False)
                })
            elif isinstance(step, str):
                tasks.append({
                    "id": f"t{i+1}",
                    "description": step,
                    "completed": False
                })
        
        transformed.append({
            "id": airdrop.get("_id", ""),
            "project_name": airdrop.get("projectName", ""),
            "logo_url": airdrop.get("logoUrl", "") or "https://api.dicebear.com/7.x/shapes/svg?seed=default",
            "description": airdrop.get("description", ""),
            "full_description": airdrop.get("fullDescription", ""),
            "backing": airdrop.get("backing", ""),
            "chain": airdrop.get("chain", ""),
            "timeline": airdrop.get("timeline", ""),
            "reward_note": airdrop.get("rewardNote", "Reward varies based on participation"),
            "tasks": tasks,
            "deadline": airdrop.get("deadline") or datetime.now(timezone.utc).isoformat(),
            "estimated_reward": airdrop.get("estimatedReward", "$0"),
            "difficulty": airdrop.get("difficulty", "Medium"),
            "status": airdrop.get("status", "active"),
            "link": airdrop.get("link", ""),
            "premium": airdrop.get("premium", False)
        })
    
    return transformed

async def get_airdrop_by_id(airdrop_id: str) -> Optional[Dict]:
    """Fetch single airdrop by ID from Sanity"""
    query = f'''*[_type == "airdrop" && _id == "{airdrop_id}"][0] {{
        _id,
        projectName,
        logoUrl,
        description,
        fullDescription,
        backing,
        chain,
        timeline,
        rewardNote,
        steps,
        deadline,
        estimatedReward,
        difficulty,
        status,
        link,
        premium
    }}'''
    
    result = await sanity.fetch(query)
    
    if not result or (isinstance(result, list) and len(result) == 0):
        return None
    
    # Handle if result is a list with one item
    airdrop = result[0] if isinstance(result, list) else result
    
    # Transform steps to tasks format
    steps = airdrop.get("steps", []) or []
    tasks = []
    for i, step in enumerate(steps):
        if isinstance(step, dict):
            tasks.append({
                "id": step.get("id", f"t{i+1}"),
                "description": step.get("description", ""),
                "completed": step.get("completed", False)
            })
        elif isinstance(step, str):
            tasks.append({
                "id": f"t{i+1}",
                "description": step,
                "completed": False
            })
    
    # Transform to match API format
    return {
        "id": airdrop.get("_id", ""),
        "project_name": airdrop.get("projectName", ""),
        "logo_url": airdrop.get("logoUrl", "") or "https://api.dicebear.com/7.x/shapes/svg?seed=default",
        "description": airdrop.get("description", ""),
        "full_description": airdrop.get("fullDescription", ""),
        "backing": airdrop.get("backing", ""),
        "chain": airdrop.get("chain", ""),
        "timeline": airdrop.get("timeline", ""),
        "reward_note": airdrop.get("rewardNote", "Reward varies based on participation"),
        "tasks": tasks,
        "deadline": airdrop.get("deadline") or datetime.now(timezone.utc).isoformat(),
        "estimated_reward": airdrop.get("estimatedReward", "$0"),
        "difficulty": airdrop.get("difficulty", "Medium"),
        "status": airdrop.get("status", "active"),
        "link": airdrop.get("link", ""),
        "premium": airdrop.get("premium", False)
    }

async def get_signals() -> List[Dict]:
    """Fetch early signals from Sanity"""
    query = '''*[_type == "signal"] | order(timestamp desc) {
        _id,
        type,
        priority,
        title,
        description,
        action,
        link,
        timestamp,
        premium
    }'''
    
    signals = await sanity.fetch(query)
    
    # Transform to match API format
    transformed = []
    for signal in signals:
        transformed.append({
            "id": signal.get("_id", ""),
            "type": signal.get("type", "opportunity"),
            "priority": signal.get("priority", "medium"),
            "title": signal.get("title", ""),
            "description": signal.get("description", ""),
            "action": signal.get("action", ""),
            "link": signal.get("link", ""),
            "timestamp": signal.get("timestamp") or datetime.now(timezone.utc).isoformat(),
            "premium": signal.get("premium", False)
        })
    
    return transformed
