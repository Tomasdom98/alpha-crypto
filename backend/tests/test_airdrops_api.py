"""
Backend API Tests for Alpha Crypto Airdrops Feature
Tests the 15 DEX airdrops endpoints and data structure
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAirdropsAPI:
    """Test airdrops API endpoints"""
    
    def test_get_all_airdrops_returns_15(self):
        """Verify GET /api/airdrops returns exactly 15 airdrops"""
        response = requests.get(f"{BASE_URL}/api/airdrops")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 15, f"Expected 15 airdrops, got {len(data)}"
    
    def test_airdrop_has_required_fields(self):
        """Verify each airdrop has all required fields"""
        response = requests.get(f"{BASE_URL}/api/airdrops")
        assert response.status_code == 200
        
        data = response.json()
        required_fields = [
            'id', 'project_name', 'logo_url', 'description', 
            'tasks', 'estimated_reward', 'difficulty', 
            'deadline', 'status', 'link', 'premium'
        ]
        
        for airdrop in data:
            for field in required_fields:
                assert field in airdrop, f"Missing field '{field}' in airdrop {airdrop.get('id', 'unknown')}"
    
    def test_airdrop_has_extended_fields(self):
        """Verify airdrops have extended fields: full_description, backing, chain, timeline"""
        response = requests.get(f"{BASE_URL}/api/airdrops")
        assert response.status_code == 200
        
        data = response.json()
        extended_fields = ['full_description', 'backing', 'chain', 'timeline']
        
        # At least some airdrops should have these fields
        for field in extended_fields:
            has_field = any(airdrop.get(field) for airdrop in data)
            assert has_field, f"No airdrop has '{field}' field populated"
    
    def test_get_single_airdrop_by_id(self):
        """Verify GET /api/airdrops/{id} returns correct airdrop"""
        # Test airdrop ID 5 (Backpack)
        response = requests.get(f"{BASE_URL}/api/airdrops/5")
        assert response.status_code == 200
        
        data = response.json()
        assert data['id'] == '5'
        assert data['project_name'] == 'Backpack'
        assert data['chain'] == 'Solana'
        assert data['premium'] == True
    
    def test_airdrop_detail_has_full_description(self):
        """Verify airdrop detail includes full_description"""
        response = requests.get(f"{BASE_URL}/api/airdrops/5")
        assert response.status_code == 200
        
        data = response.json()
        assert 'full_description' in data
        assert data['full_description'] is not None
        assert len(data['full_description']) > 50, "full_description should be detailed"
    
    def test_airdrop_detail_has_backing_info(self):
        """Verify airdrop detail includes investor backing info"""
        response = requests.get(f"{BASE_URL}/api/airdrops/5")
        assert response.status_code == 200
        
        data = response.json()
        assert 'backing' in data
        assert data['backing'] is not None
        assert len(data['backing']) > 10, "backing info should be present"
    
    def test_airdrop_detail_has_timeline(self):
        """Verify airdrop detail includes timeline"""
        response = requests.get(f"{BASE_URL}/api/airdrops/5")
        assert response.status_code == 200
        
        data = response.json()
        assert 'timeline' in data
        assert data['timeline'] is not None
    
    def test_airdrop_tasks_structure(self):
        """Verify tasks have correct structure with id, description, completed"""
        response = requests.get(f"{BASE_URL}/api/airdrops/1")
        assert response.status_code == 200
        
        data = response.json()
        tasks = data.get('tasks', [])
        assert len(tasks) > 0, "Airdrop should have tasks"
        
        for task in tasks:
            assert 'id' in task, "Task missing 'id'"
            assert 'description' in task, "Task missing 'description'"
            assert 'completed' in task, "Task missing 'completed'"
            assert isinstance(task['completed'], bool), "Task 'completed' should be boolean"
    
    def test_premium_airdrops_exist(self):
        """Verify some airdrops are marked as premium"""
        response = requests.get(f"{BASE_URL}/api/airdrops")
        assert response.status_code == 200
        
        data = response.json()
        premium_count = sum(1 for a in data if a.get('premium'))
        assert premium_count > 0, "Should have at least one premium airdrop"
        assert premium_count < len(data), "Not all airdrops should be premium"
    
    def test_airdrop_not_found_returns_404(self):
        """Verify non-existent airdrop returns 404"""
        response = requests.get(f"{BASE_URL}/api/airdrops/999")
        assert response.status_code == 404
    
    def test_task_toggle_endpoint(self):
        """Verify POST /api/airdrops/{id}/tasks/{task_id}/toggle works"""
        response = requests.post(f"{BASE_URL}/api/airdrops/1/tasks/t1/toggle")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get('success') == True
        assert data.get('task_id') == 't1'
    
    def test_all_15_airdrops_accessible(self):
        """Verify all 15 airdrops can be accessed individually"""
        for airdrop_id in range(1, 16):
            response = requests.get(f"{BASE_URL}/api/airdrops/{airdrop_id}")
            assert response.status_code == 200, f"Airdrop {airdrop_id} not accessible"
            data = response.json()
            assert data['id'] == str(airdrop_id)
    
    def test_difficulty_values_valid(self):
        """Verify difficulty values are Easy, Medium, or Hard"""
        response = requests.get(f"{BASE_URL}/api/airdrops")
        assert response.status_code == 200
        
        data = response.json()
        valid_difficulties = ['Easy', 'Medium', 'Hard']
        
        for airdrop in data:
            difficulty = airdrop.get('difficulty')
            assert difficulty in valid_difficulties, f"Invalid difficulty '{difficulty}' for airdrop {airdrop['id']}"
    
    def test_chain_values_present(self):
        """Verify chain field is present and populated"""
        response = requests.get(f"{BASE_URL}/api/airdrops")
        assert response.status_code == 200
        
        data = response.json()
        chains_found = set()
        
        for airdrop in data:
            chain = airdrop.get('chain')
            if chain:
                chains_found.add(chain)
        
        # Should have multiple chains
        assert len(chains_found) >= 3, f"Expected at least 3 different chains, found: {chains_found}"


class TestAPIHealth:
    """Test API health and basic endpoints"""
    
    def test_api_root(self):
        """Verify API root endpoint works"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
    
    def test_crypto_prices_endpoint(self):
        """Verify crypto prices endpoint works"""
        response = requests.get(f"{BASE_URL}/api/crypto/prices")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
