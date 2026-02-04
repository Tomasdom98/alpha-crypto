"""
FASE 1 Features Backend API Tests
Tests for: Market Indices, Live Prices, Airdrops, Feedback, Articles
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCryptoPrices:
    """Live crypto prices API tests"""
    
    def test_get_crypto_prices_returns_4_coins(self):
        """GET /api/crypto/prices returns BTC, ETH, SOL, USDC"""
        response = requests.get(f"{BASE_URL}/api/crypto/prices")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 4
        
        symbols = [coin['symbol'] for coin in data]
        assert 'BTC' in symbols
        assert 'ETH' in symbols
        assert 'SOL' in symbols
        assert 'USDC' in symbols
    
    def test_crypto_prices_have_required_fields(self):
        """Each price entry has required fields"""
        response = requests.get(f"{BASE_URL}/api/crypto/prices")
        assert response.status_code == 200
        
        data = response.json()
        for coin in data:
            assert 'id' in coin
            assert 'symbol' in coin
            assert 'name' in coin
            assert 'current_price' in coin
            assert 'price_change_24h' in coin
            assert 'market_cap' in coin
            assert 'volume_24h' in coin


class TestFearGreedIndex:
    """Fear & Greed Index API tests"""
    
    def test_get_fear_greed_index(self):
        """GET /api/crypto/fear-greed returns valid data"""
        response = requests.get(f"{BASE_URL}/api/crypto/fear-greed")
        assert response.status_code == 200
        
        data = response.json()
        assert 'value' in data
        assert 'classification' in data
        assert 'timestamp' in data
        
        # Value should be between 0 and 100
        assert 0 <= data['value'] <= 100
        
        # Classification should be a valid string
        assert isinstance(data['classification'], str)
        assert len(data['classification']) > 0


class TestMarketIndices:
    """Market Indices API tests"""
    
    def test_get_market_indices(self):
        """GET /api/market-indices returns all indices"""
        response = requests.get(f"{BASE_URL}/api/market-indices")
        assert response.status_code == 200
        
        data = response.json()
        assert 'bitcoin_rainbow' in data
        assert 'altcoin_season_index' in data
        assert 'defi_tvl' in data
        assert 'stablecoin_dominance' in data
    
    def test_market_indices_bitcoin_rainbow(self):
        """Bitcoin rainbow has recommendation"""
        response = requests.get(f"{BASE_URL}/api/market-indices")
        data = response.json()
        
        rainbow = data['bitcoin_rainbow']
        assert 'current_position' in rainbow
        assert 'price_band' in rainbow
        assert 'recommendation' in rainbow


class TestArticles:
    """Articles API tests - 3 new Spanish articles"""
    
    def test_get_articles_returns_5_articles(self):
        """GET /api/articles returns 5 articles including 3 new Spanish ones"""
        response = requests.get(f"{BASE_URL}/api/articles")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 5
    
    def test_stablecoins_article_exists(self):
        """Stablecoins article exists with Spanish content"""
        response = requests.get(f"{BASE_URL}/api/articles")
        data = response.json()
        
        stablecoins = next((a for a in data if 'Stablecoins' in a['title']), None)
        assert stablecoins is not None
        assert 'Revolución' in stablecoins['title']  # Spanish title
        assert stablecoins['category'] == 'Stablecoins'
        assert 'image_url' in stablecoins
        assert stablecoins['image_url'].startswith('https://')
    
    def test_ai_agents_article_exists(self):
        """AI Agents article exists with Spanish content"""
        response = requests.get(f"{BASE_URL}/api/articles")
        data = response.json()
        
        ai_article = next((a for a in data if 'AI Agents' in a['title']), None)
        assert ai_article is not None
        assert 'Economía' in ai_article['title']  # Spanish title
        assert ai_article['category'] == 'AI'
        assert ai_article['premium'] == True  # Premium article
        assert 'image_url' in ai_article
    
    def test_crypto_2026_article_exists(self):
        """Crypto 2026 article exists with Spanish content"""
        response = requests.get(f"{BASE_URL}/api/articles")
        data = response.json()
        
        crypto_2026 = next((a for a in data if '2026' in a['title']), None)
        assert crypto_2026 is not None
        assert 'Crypto' in crypto_2026['title']
        assert crypto_2026['category'] == 'Analysis'
        assert 'image_url' in crypto_2026
    
    def test_articles_have_relevant_images(self):
        """Articles have image URLs from Unsplash"""
        response = requests.get(f"{BASE_URL}/api/articles")
        data = response.json()
        
        for article in data:
            assert 'image_url' in article
            assert article['image_url'].startswith('https://images.unsplash.com/')


class TestAirdrops:
    """Airdrops API tests - 15 airdrops with reward notes"""
    
    def test_get_airdrops_returns_15(self):
        """GET /api/airdrops returns 15 airdrops"""
        response = requests.get(f"{BASE_URL}/api/airdrops")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 15
    
    def test_airdrops_have_dicebear_logos(self):
        """All airdrops have DiceBear avatar logos"""
        response = requests.get(f"{BASE_URL}/api/airdrops")
        data = response.json()
        
        for airdrop in data:
            assert 'logo_url' in airdrop
            assert 'dicebear.com' in airdrop['logo_url']
    
    def test_airdrops_have_reward_note(self):
        """All airdrops have reward_note field"""
        response = requests.get(f"{BASE_URL}/api/airdrops")
        data = response.json()
        
        for airdrop in data:
            assert 'reward_note' in airdrop
            assert airdrop['reward_note'] is not None
            assert 'volume' in airdrop['reward_note'].lower() or 'points' in airdrop['reward_note'].lower()
    
    def test_airdrops_have_estimated_reward(self):
        """All airdrops have estimated_reward field"""
        response = requests.get(f"{BASE_URL}/api/airdrops")
        data = response.json()
        
        for airdrop in data:
            assert 'estimated_reward' in airdrop
            assert '$' in airdrop['estimated_reward']
    
    def test_airdrop_detail_has_reward_note(self):
        """GET /api/airdrops/{id} returns reward_note"""
        response = requests.get(f"{BASE_URL}/api/airdrops/1")
        assert response.status_code == 200
        
        data = response.json()
        assert 'reward_note' in data
        assert data['reward_note'] is not None


class TestFeedback:
    """Feedback API tests"""
    
    def test_submit_feedback_success(self):
        """POST /api/feedback saves feedback"""
        payload = {
            "name": "TEST_Feedback User",
            "email": "test_feedback@example.com",
            "message": "This is a test feedback message"
        }
        response = requests.post(f"{BASE_URL}/api/feedback", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data['success'] == True
        assert 'message' in data
    
    def test_submit_feedback_validation(self):
        """POST /api/feedback validates required fields"""
        # Missing message field
        payload = {
            "name": "Test User",
            "email": "test@example.com"
        }
        response = requests.post(f"{BASE_URL}/api/feedback", json=payload)
        assert response.status_code == 422  # Validation error
    
    def test_get_admin_feedback(self):
        """GET /api/admin/feedback returns feedback list"""
        response = requests.get(f"{BASE_URL}/api/admin/feedback")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        # Should have at least one feedback from our test
        if len(data) > 0:
            feedback = data[0]
            assert 'id' in feedback
            assert 'name' in feedback
            assert 'email' in feedback
            assert 'message' in feedback
            assert 'created_at' in feedback
            assert 'read' in feedback
    
    def test_mark_feedback_read(self):
        """POST /api/admin/feedback/{id}/read marks as read"""
        # First get feedback list
        response = requests.get(f"{BASE_URL}/api/admin/feedback")
        data = response.json()
        
        if len(data) > 0:
            feedback_id = data[0]['id']
            
            # Mark as read
            response = requests.post(f"{BASE_URL}/api/admin/feedback/{feedback_id}/read")
            assert response.status_code == 200
            
            result = response.json()
            assert result['success'] == True


class TestMarketStats:
    """Market stats API tests"""
    
    def test_get_market_stats(self):
        """GET /api/crypto/market-stats returns stats"""
        response = requests.get(f"{BASE_URL}/api/crypto/market-stats")
        assert response.status_code == 200
        
        data = response.json()
        assert 'total_market_cap' in data
        assert 'btc_dominance' in data
        assert 'total_volume_24h' in data


class TestGainersLosers:
    """Gainers and losers API tests"""
    
    def test_get_gainers_losers(self):
        """GET /api/market-indices/gainers-losers returns data"""
        response = requests.get(f"{BASE_URL}/api/market-indices/gainers-losers")
        assert response.status_code == 200
        
        data = response.json()
        assert 'gainers' in data
        assert 'losers' in data
        assert len(data['gainers']) > 0
        assert len(data['losers']) > 0
