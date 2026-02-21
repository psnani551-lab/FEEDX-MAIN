#!/usr/bin/env python3
"""Test script to check SBTET API response structure"""

import requests
import json
import sys

def test_backend_api(pin="24054-cps-020"):
    """Test our Flask backend API"""
    print(f"\n{'='*80}")
    print(f"Testing Backend API: http://localhost:5001/api/attendance?pin={pin}")
    print('='*80)
    
    try:
        response = requests.get(f"http://localhost:5001/api/attendance?pin={pin}", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"\nResponse:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error: {e}")

def test_sbtet_api(pin="24054-cps-020"):
    """Test the SBTET API directly"""
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)"
            " Chrome/122.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.9",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://www.sbtet.telangana.gov.in/",
    }
    
    urls = [
        f"https://www.sbtet.telangana.gov.in/api/api/PreExamination/getAttendanceReport?Pin={pin}"
    ]
    
    for url in urls:
        print(f"\n{'='*80}")
        print(f"Testing URL: {url}")
        print('='*80)
        
        try:
            response = requests.get(url, headers=headers, timeout=15)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                # First, check raw response
                print(f"\nRaw Response Text (first 500 chars):")
                print(response.text[:500])
                print("\n")
                
                try:
                    data = response.json()
                    print(f"Response Type: {type(data)}")
                except json.JSONDecodeError as e:
                    print(f"JSON Decode Error: {e}")
                    print(f"\nFull Raw Response:")
                    print(response.text)
                    return None
                
                if isinstance(data, dict):
                    print(f"\nTop-level Keys: {list(data.keys())}")
                    
                    for key, value in data.items():
                        if isinstance(value, list):
                            print(f"\n{key}:")
                            print(f"  - Type: List")
                            print(f"  - Length: {len(value)}")
                            if value:
                                print(f"  - First item type: {type(value[0])}")
                                if isinstance(value[0], dict):
                                    print(f"  - First item keys: {list(value[0].keys())}")
                                    print(f"  - First item sample:")
                                    for k, v in list(value[0].items())[:5]:
                                        print(f"      {k}: {v}")
                        else:
                            print(f"\n{key}: {type(value)}")
                    
                    print("\n" + "="*80)
                    print("FULL RESPONSE:")
                    print("="*80)
                    print(json.dumps(data, indent=2, ensure_ascii=False))
                
                return data
            else:
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"Exception: {e}")
    
    return None

if __name__ == "__main__":
    pin = sys.argv[1] if len(sys.argv) > 1 else "24054-cps-020"
    print(f"Testing with PIN: {pin}\n")
    
    # Test backend first
    print("=" * 80)
    print("1. Testing Backend API (Flask)")
    print("=" * 80)
    test_backend_api(pin)
    
    # Then test SBTET directly
    print("\n" + "=" * 80)
    print("2. Testing SBTET API Directly")
    print("=" * 80)
    test_sbtet_api(pin)
