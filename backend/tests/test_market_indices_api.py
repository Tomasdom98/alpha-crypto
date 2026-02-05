"""
Test Market Indices APIs - Testing real-time data from DeFiLlama, CoinGecko, Alternative.me
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestMarketIndicesAPIs:
    """Test Market Indices API endpoints with real data"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Alpha Crypto API"
    
    def test_fear_greed_index(self):
        """Test Fear & Greed Index from Alternative.me"""
        response = requests.get(f"{BASE_URL}/api/crypto/fear-greed")
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "value" in data
        assert "classification" in data
        assert "timestamp" in data
        
        # Validate data types and ranges
        assert isinstance(data["value"], int)
        assert 0 <= data["value"] <= 100
        assert isinstance(data["classification"], str)
        assert data["classification"] in ["Extreme Fear", "Fear", "Neutral", "Greed", "Extreme Greed"]
    
    def test_stablecoins_data(self):
        """Test Stablecoins data from DeFiLlama"""
        response = requests.get(f"{BASE_URL}/api/crypto/stablecoins")
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "total_market_cap" in data
        assert "top_stablecoins" in data
        assert "updated_at" in data
        assert "source" in data
        
        # Validate total market cap is reasonable (> $100B)
        assert data["total_market_cap"] > 100_000_000_000
        
        # Validate top stablecoins list
        assert isinstance(data["top_stablecoins"], list)
        assert len(data["top_stablecoins"]) >= 5
        
        # Validate first stablecoin structure
        first_stable = data["top_stablecoins"][0]
        assert "name" in first_stable
        assert "symbol" in first_stable
        assert "market_cap" in first_stable
        assert "percentage" in first_stable
        
        # USDT should be the largest
        assert first_stable["symbol"] == "USDT"
        assert first_stable["market_cap"] > 100_000_000_000
    
    def test_defi_tvl(self):
        """Test DeFi TVL from DeFiLlama"""
        response = requests.get(f"{BASE_URL}/api/crypto/defi-tvl")
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "total_tvl" in data
        assert "change_24h" in data
        assert "updated_at" in data
        assert "source" in data
        
        # Validate TVL is reasonable (> $50B)
        assert data["total_tvl"] > 50_000_000_000
        
        # Validate change_24h is a number
        assert isinstance(data["change_24h"], (int, float))
        
        # Source should be DefiLlama
        assert "DefiLlama" in data["source"]
    
    def test_global_market_data(self):
        """Test Global Market Data from CoinGecko"""
        response = requests.get(f"{BASE_URL}/api/crypto/global")
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "total_market_cap_usd" in data
        assert "total_volume_24h_usd" in data
        assert "btc_dominance" in data
        assert "eth_dominance" in data
        assert "active_cryptocurrencies" in data
        assert "market_cap_change_24h" in data
        
        # Validate market cap is reasonable (> $1T)
        assert data["total_market_cap_usd"] > 1_000_000_000_000
        
        # Validate BTC dominance is reasonable (30-70%)
        assert 30 <= data["btc_dominance"] <= 70
        
        # Validate ETH dominance is reasonable (5-30%)
        assert 5 <= data["eth_dominance"] <= 30


class TestArticlesAPI:
    """Test Articles API - verify no emojis in titles"""
    
    def test_articles_list(self):
        """Test articles list endpoint"""
        response = requests.get(f"{BASE_URL}/api/articles")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 5
    
    def test_articles_no_emojis_in_titles(self):
        """Test that article titles have no emojis (except owl at end of content)"""
        response = requests.get(f"{BASE_URL}/api/articles")
        assert response.status_code == 200
        articles = response.json()
        
        # Common emojis to check for in titles
        emoji_ranges = [
            (0x1F600, 0x1F64F),  # Emoticons
            (0x1F300, 0x1F5FF),  # Misc Symbols and Pictographs
            (0x1F680, 0x1F6FF),  # Transport and Map
            (0x1F1E0, 0x1F1FF),  # Flags
            (0x2600, 0x26FF),    # Misc symbols
            (0x2700, 0x27BF),    # Dingbats
            (0x1F900, 0x1F9FF),  # Supplemental Symbols
        ]
        
        def has_emoji(text):
            for char in text:
                code = ord(char)
                for start, end in emoji_ranges:
                    if start <= code <= end:
                        return True
            return False
        
        for article in articles:
            title = article.get("title", "")
            assert not has_emoji(title), f"Article title contains emoji: {title}"
    
    def test_articles_have_tables_in_content(self):
        """Test that articles have markdown tables in content"""
        response = requests.get(f"{BASE_URL}/api/articles")
        assert response.status_code == 200
        articles = response.json()
        
        # At least some articles should have tables
        articles_with_tables = 0
        for article in articles:
            content = article.get("content", "")
            if "|" in content and "---" in content:
                articles_with_tables += 1
        
        assert articles_with_tables >= 3, f"Expected at least 3 articles with tables, found {articles_with_tables}"
    
    def test_article_detail(self):
        """Test single article endpoint"""
        response = requests.get(f"{BASE_URL}/api/articles/1")
        assert response.status_code == 200
        article = response.json()
        
        assert "id" in article
        assert "title" in article
        assert "content" in article
        assert "category" in article
        assert "published_at" in article
    
    def test_article_content_has_owl_signature(self):
        """Test that articles have owl emoji (🦉) as signature at end"""
        response = requests.get(f"{BASE_URL}/api/articles")
        assert response.status_code == 200
        articles = response.json()
        
        # Check that articles end with owl emoji
        articles_with_owl = 0
        for article in articles:
            content = article.get("content", "")
            if "🦉" in content:
                articles_with_owl += 1
        
        assert articles_with_owl >= 3, f"Expected at least 3 articles with owl signature, found {articles_with_owl}"


class TestCryptoPricesAPI:
    """Test Crypto Prices API"""
    
    def test_crypto_prices(self):
        """Test crypto prices endpoint"""
        response = requests.get(f"{BASE_URL}/api/crypto/prices")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 4
        
        # Check for expected coins
        symbols = [coin["symbol"] for coin in data]
        assert "BTC" in symbols
        assert "ETH" in symbols
        assert "SOL" in symbols


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
