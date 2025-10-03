#!/usr/bin/env python3

import requests
import json

# Sample tests data
sample_tests = [
    # Microbiology tests
    {
        "name": "Blood Culture",
        "category": "microbiology",
        "description": "Detection of bacteria and fungi in blood samples",
        "normalRange": "Negative",
        "unit": "CFU/mL",
        "price": 150.00
    },
    {
        "name": "Urine Culture",
        "category": "microbiology",
        "description": "Detection of bacteria in urine samples",
        "normalRange": "< 10,000 CFU/mL",
        "unit": "CFU/mL",
        "price": 75.00
    },
    
    # Vitamin tests
    {
        "name": "Vitamin D (25-OH)",
        "category": "vitamin",
        "description": "Measurement of vitamin D levels in blood",
        "normalRange": "30-100 ng/mL",
        "unit": "ng/mL",
        "price": 120.00
    },
    {
        "name": "Vitamin B12",
        "category": "vitamin",
        "description": "Measurement of vitamin B12 levels",
        "normalRange": "200-900 pg/mL",
        "unit": "pg/mL",
        "price": 95.00
    },
    
    # Biochemistry tests
    {
        "name": "Glucose (Fasting)",
        "category": "biochemistry",
        "description": "Blood glucose level after fasting",
        "normalRange": "70-100 mg/dL",
        "unit": "mg/dL",
        "price": 25.00
    },
    {
        "name": "Total Cholesterol",
        "category": "biochemistry",
        "description": "Total cholesterol level in blood",
        "normalRange": "< 200 mg/dL",
        "unit": "mg/dL",
        "price": 35.00
    },
    
    # Hematology tests
    {
        "name": "Complete Blood Count (CBC)",
        "category": "hematology",
        "description": "Complete blood count including RBC, WBC, platelets",
        "normalRange": "See individual components",
        "unit": "Various",
        "price": 45.00
    },
    {
        "name": "Hemoglobin A1c",
        "category": "hematology",
        "description": "Average blood glucose over 2-3 months",
        "normalRange": "< 5.7%",
        "unit": "%",
        "price": 55.00
    },
    
    # Immunology tests
    {
        "name": "COVID-19 Antibody Test",
        "category": "immunology",
        "description": "Detection of COVID-19 antibodies",
        "normalRange": "Negative/Positive",
        "unit": "Index",
        "price": 85.00
    },
    {
        "name": "Allergy Panel (Food)",
        "category": "immunology",
        "description": "Testing for food allergies",
        "normalRange": "See individual allergens",
        "unit": "kU/L",
        "price": 200.00
    }
]

def add_tests():
    # First, get authentication token
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        # Login to get token
        login_response = requests.post(
            "http://localhost:8000/api/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code != 200:
            print(f"Login failed: {login_response.status_code}")
            print(login_response.text)
            return
        
        token = login_response.json().get("token")
        if not token:
            print("No token received from login")
            return
        
        print(f"Successfully logged in. Token: {token[:20]}...")
        
        # Add each test
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        for test in sample_tests:
            try:
                response = requests.post(
                    "http://localhost:8000/api/test-catalog",
                    json=test,
                    headers=headers
                )
                
                if response.status_code == 201:
                    print(f"✅ Added test: {test['name']} ({test['category']})")
                else:
                    print(f"❌ Failed to add {test['name']}: {response.status_code}")
                    print(f"   Response: {response.text}")
                    
            except Exception as e:
                print(f"❌ Error adding {test['name']}: {e}")
        
        print("\n🎉 Sample tests addition completed!")
        
    except Exception as e:
        print(f"❌ Error during login: {e}")

if __name__ == "__main__":
    add_tests()


