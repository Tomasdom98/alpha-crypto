"""
FASE 3 Tests: Consulting and Email Alert Subscription Features
Tests for:
- POST /api/consulting - Submit consulting request
- GET /api/admin/consulting - Get consulting requests
- POST /api/admin/consulting/{id}/status - Update consulting status
- POST /api/alerts/subscribe - Subscribe to email alerts
- GET /api/admin/alert-subscribers - Get alert subscribers
- POST /api/alerts/unsubscribe - Unsubscribe from alerts
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestConsultingAPI:
    """Consulting endpoint tests"""
    
    def test_submit_consulting_personal(self):
        """Test submitting personal consulting request"""
        payload = {
            "name": f"TEST_Personal_{uuid.uuid4().hex[:6]}",
            "email": f"test_personal_{uuid.uuid4().hex[:6]}@example.com",
            "message": "I need help with my crypto portfolio",
            "service_type": "personal"
        }
        response = requests.post(f"{BASE_URL}/api/consulting", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "message" in data
        print(f"SUCCESS: Personal consulting request submitted")
    
    def test_submit_consulting_business(self):
        """Test submitting business consulting request with company"""
        payload = {
            "name": f"TEST_Business_{uuid.uuid4().hex[:6]}",
            "email": f"test_business_{uuid.uuid4().hex[:6]}@example.com",
            "company": "Test Corporation",
            "message": "We need treasury management consulting",
            "service_type": "business"
        }
        response = requests.post(f"{BASE_URL}/api/consulting", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"SUCCESS: Business consulting request submitted")
    
    def test_submit_consulting_without_company(self):
        """Test submitting consulting request without optional company field"""
        payload = {
            "name": f"TEST_NoCompany_{uuid.uuid4().hex[:6]}",
            "email": f"test_nocompany_{uuid.uuid4().hex[:6]}@example.com",
            "message": "Testing without company field",
            "service_type": "personal"
        }
        response = requests.post(f"{BASE_URL}/api/consulting", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"SUCCESS: Consulting request without company submitted")
    
    def test_get_consulting_requests(self):
        """Test getting all consulting requests"""
        response = requests.get(f"{BASE_URL}/api/admin/consulting")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            # Verify structure of consulting request
            request = data[0]
            assert "id" in request
            assert "name" in request
            assert "email" in request
            assert "message" in request
            assert "service_type" in request
            assert "created_at" in request
            assert "status" in request
            print(f"SUCCESS: Retrieved {len(data)} consulting requests")
        else:
            print("INFO: No consulting requests found")
    
    def test_consulting_request_persistence(self):
        """Test that consulting request is persisted and retrievable"""
        unique_name = f"TEST_Persist_{uuid.uuid4().hex[:8]}"
        payload = {
            "name": unique_name,
            "email": f"persist_{uuid.uuid4().hex[:6]}@example.com",
            "company": "Persistence Test Corp",
            "message": "Testing data persistence",
            "service_type": "business"
        }
        
        # Create request
        create_response = requests.post(f"{BASE_URL}/api/consulting", json=payload)
        assert create_response.status_code == 200
        
        # Verify it appears in list
        get_response = requests.get(f"{BASE_URL}/api/admin/consulting")
        assert get_response.status_code == 200
        
        data = get_response.json()
        found = any(r["name"] == unique_name for r in data)
        assert found, f"Created consulting request '{unique_name}' not found in list"
        print(f"SUCCESS: Consulting request persisted and retrieved")


class TestConsultingStatusUpdate:
    """Tests for consulting status update functionality"""
    
    def test_update_consulting_status_to_contacted(self):
        """Test updating consulting status to contacted"""
        # First create a consulting request
        unique_name = f"TEST_Status_{uuid.uuid4().hex[:8]}"
        payload = {
            "name": unique_name,
            "email": f"status_{uuid.uuid4().hex[:6]}@example.com",
            "message": "Testing status update",
            "service_type": "personal"
        }
        requests.post(f"{BASE_URL}/api/consulting", json=payload)
        
        # Get the request ID
        get_response = requests.get(f"{BASE_URL}/api/admin/consulting")
        data = get_response.json()
        request_item = next((r for r in data if r["name"] == unique_name), None)
        
        if request_item:
            request_id = request_item["id"]
            
            # Update status
            update_response = requests.post(
                f"{BASE_URL}/api/admin/consulting/{request_id}/status?status=contacted"
            )
            assert update_response.status_code == 200
            
            # Verify status changed
            verify_response = requests.get(f"{BASE_URL}/api/admin/consulting")
            verify_data = verify_response.json()
            updated_item = next((r for r in verify_data if r["id"] == request_id), None)
            
            assert updated_item is not None
            assert updated_item["status"] == "contacted"
            print(f"SUCCESS: Consulting status updated to 'contacted'")
        else:
            pytest.skip("Could not find created consulting request")


class TestAlertSubscriptionAPI:
    """Email alert subscription endpoint tests"""
    
    def test_subscribe_to_alerts(self):
        """Test subscribing to email alerts"""
        unique_email = f"test_sub_{uuid.uuid4().hex[:8]}@example.com"
        payload = {"email": unique_email}
        
        response = requests.post(f"{BASE_URL}/api/alerts/subscribe", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"SUCCESS: Subscribed to alerts with email {unique_email}")
    
    def test_subscribe_duplicate_email(self):
        """Test subscribing with same email returns success (already subscribed)"""
        unique_email = f"test_dup_{uuid.uuid4().hex[:8]}@example.com"
        payload = {"email": unique_email}
        
        # First subscription
        response1 = requests.post(f"{BASE_URL}/api/alerts/subscribe", json=payload)
        assert response1.status_code == 200
        
        # Second subscription with same email
        response2 = requests.post(f"{BASE_URL}/api/alerts/subscribe", json=payload)
        assert response2.status_code == 200
        data = response2.json()
        assert data["success"] == True
        print(f"SUCCESS: Duplicate subscription handled correctly")
    
    def test_get_alert_subscribers(self):
        """Test getting list of alert subscribers"""
        response = requests.get(f"{BASE_URL}/api/admin/alert-subscribers")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            subscriber = data[0]
            assert "id" in subscriber
            assert "email" in subscriber
            assert "subscribed_at" in subscriber
            assert "active" in subscriber
            print(f"SUCCESS: Retrieved {len(data)} subscribers")
        else:
            print("INFO: No subscribers found")
    
    def test_subscriber_persistence(self):
        """Test that subscriber is persisted and retrievable"""
        unique_email = f"test_persist_{uuid.uuid4().hex[:8]}@example.com"
        payload = {"email": unique_email}
        
        # Subscribe
        sub_response = requests.post(f"{BASE_URL}/api/alerts/subscribe", json=payload)
        assert sub_response.status_code == 200
        
        # Verify in list
        get_response = requests.get(f"{BASE_URL}/api/admin/alert-subscribers")
        assert get_response.status_code == 200
        
        data = get_response.json()
        found = any(s["email"] == unique_email for s in data)
        assert found, f"Subscriber '{unique_email}' not found in list"
        print(f"SUCCESS: Subscriber persisted and retrieved")
    
    def test_unsubscribe_from_alerts(self):
        """Test unsubscribing from email alerts"""
        unique_email = f"test_unsub_{uuid.uuid4().hex[:8]}@example.com"
        payload = {"email": unique_email}
        
        # First subscribe
        requests.post(f"{BASE_URL}/api/alerts/subscribe", json=payload)
        
        # Then unsubscribe
        unsub_response = requests.post(f"{BASE_URL}/api/alerts/unsubscribe", json=payload)
        assert unsub_response.status_code == 200
        data = unsub_response.json()
        assert data["success"] == True
        print(f"SUCCESS: Unsubscribed from alerts")


class TestEarlySignalsAPI:
    """Early signals endpoint tests"""
    
    def test_get_early_signals(self):
        """Test getting early signals"""
        response = requests.get(f"{BASE_URL}/api/early-signals")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Verify signal structure
        signal = data[0]
        assert "id" in signal
        assert "type" in signal
        assert "priority" in signal
        assert "title" in signal
        assert "description" in signal
        assert "timestamp" in signal
        print(f"SUCCESS: Retrieved {len(data)} early signals")


class TestAdminTabsData:
    """Tests for admin panel data endpoints"""
    
    def test_admin_payments_pending(self):
        """Test getting pending payments"""
        response = requests.get(f"{BASE_URL}/api/admin/payments?status=pending")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Retrieved {len(data)} pending payments")
    
    def test_admin_payments_verified(self):
        """Test getting verified payments"""
        response = requests.get(f"{BASE_URL}/api/admin/payments?status=verified")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Retrieved {len(data)} verified payments")
    
    def test_admin_users(self):
        """Test getting premium users"""
        response = requests.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Retrieved {len(data)} premium users")
    
    def test_admin_feedback(self):
        """Test getting feedback"""
        response = requests.get(f"{BASE_URL}/api/admin/feedback")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Retrieved {len(data)} feedback items")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
