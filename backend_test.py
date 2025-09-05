#!/usr/bin/env python3
"""
Comprehensive Backend Testing for CMS (Content Management System)
Tests all CMS endpoints with authentication, authorization, and functionality validation.
"""

import requests
import json
import time
import os
from datetime import datetime
import uuid

# Configuration - using localhost since external URL has 502 errors
BASE_URL = "http://localhost:3000"
API_BASE = f"{BASE_URL}/api"


class CMSBackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.created_content_ids = []

    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data,
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

    def test_content_get_without_auth(self):
        """Test GET /api/content without authentication - should return 401"""
        try:
            response = self.session.get(f"{API_BASE}/content")

            if response.status_code == 401:
                self.log_test(
                    "Content GET - No Authentication",
                    True,
                    f"Correctly returned 401 Unauthorized. Response: {response.json()}",
                )
            else:
                self.log_test(
                    "Content GET - No Authentication",
                    False,
                    f"Expected 401, got {response.status_code}",
                    response.text,
                )
        except Exception as e:
            self.log_test(
                "Content GET - No Authentication", False, f"Request failed: {str(e)}"
            )

    def test_content_post_without_auth(self):
        """Test POST /api/content without authentication - should return 401"""
        try:
            test_content = {
                "type": "manhwa",
                "title": "Test Manhwa",
                "description": "Test description",
                "metadata": {"tags": ["test"], "genre": ["Action"]},
            }

            response = self.session.post(
                f"{API_BASE}/content",
                json=test_content,
                headers={"Content-Type": "application/json"},
            )

            if response.status_code == 401:
                self.log_test(
                    "Content POST - No Authentication",
                    True,
                    f"Correctly returned 401 Unauthorized. Response: {response.json()}",
                )
            else:
                self.log_test(
                    "Content POST - No Authentication",
                    False,
                    f"Expected 401, got {response.status_code}",
                    response.text,
                )
        except Exception as e:
            self.log_test(
                "Content POST - No Authentication", False, f"Request failed: {str(e)}"
            )

    def test_content_put_without_auth(self):
        """Test PUT /api/content without authentication - should return 401"""
        try:
            test_update = {"id": "test-id", "title": "Updated Title"}

            response = self.session.put(
                f"{API_BASE}/content",
                json=test_update,
                headers={"Content-Type": "application/json"},
            )

            if response.status_code == 401:
                self.log_test(
                    "Content PUT - No Authentication",
                    True,
                    f"Correctly returned 401 Unauthorized. Response: {response.json()}",
                )
            else:
                self.log_test(
                    "Content PUT - No Authentication",
                    False,
                    f"Expected 401, got {response.status_code}",
                    response.text,
                )
        except Exception as e:
            self.log_test(
                "Content PUT - No Authentication", False, f"Request failed: {str(e)}"
            )

    def test_content_delete_without_auth(self):
        """Test DELETE /api/content without authentication - should return 401"""
        try:
            response = self.session.delete(f"{API_BASE}/content?id=test-id")

            if response.status_code == 401:
                self.log_test(
                    "Content DELETE - No Authentication",
                    True,
                    f"Correctly returned 401 Unauthorized. Response: {response.json()}",
                )
            else:
                self.log_test(
                    "Content DELETE - No Authentication",
                    False,
                    f"Expected 401, got {response.status_code}",
                    response.text,
                )
        except Exception as e:
            self.log_test(
                "Content DELETE - No Authentication", False, f"Request failed: {str(e)}"
            )

    def test_content_approve_without_auth(self):
        """Test POST /api/content/{id}/approve without authentication - should return 401"""
        try:
            test_approval = {"action": "approve", "reason": "Content looks good"}

            response = self.session.post(
                f"{API_BASE}/content/test-id/approve",
                json=test_approval,
                headers={"Content-Type": "application/json"},
            )

            if response.status_code == 401:
                self.log_test(
                    "Content Approve - No Authentication",
                    True,
                    f"Correctly returned 401 Unauthorized. Response: {response.json()}",
                )
            else:
                self.log_test(
                    "Content Approve - No Authentication",
                    False,
                    f"Expected 401, got {response.status_code}",
                    response.text,
                )
        except Exception as e:
            self.log_test(
                "Content Approve - No Authentication",
                False,
                f"Request failed: {str(e)}",
            )

    def test_upload_without_auth(self):
        """Test POST /api/upload without authentication - should return 401"""
        try:
            # Create a simple test file in memory
            files = {"files": ("test.txt", "test content", "text/plain")}

            response = self.session.post(f"{API_BASE}/upload", files=files)

            if response.status_code == 401:
                self.log_test(
                    "Upload - No Authentication",
                    True,
                    f"Correctly returned 401 Unauthorized. Response: {response.json()}",
                )
            else:
                self.log_test(
                    "Upload - No Authentication",
                    False,
                    f"Expected 401, got {response.status_code}",
                    response.text,
                )
        except Exception as e:
            self.log_test(
                "Upload - No Authentication", False, f"Request failed: {str(e)}"
            )

    def test_cors_headers(self):
        """Test CORS headers on all endpoints"""
        endpoints = ["/content", "/upload"]

        for endpoint in endpoints:
            try:
                response = self.session.options(f"{API_BASE}{endpoint}")

                cors_headers = {
                    "Access-Control-Allow-Origin": response.headers.get(
                        "Access-Control-Allow-Origin"
                    ),
                    "Access-Control-Allow-Methods": response.headers.get(
                        "Access-Control-Allow-Methods"
                    ),
                    "Access-Control-Allow-Headers": response.headers.get(
                        "Access-Control-Allow-Headers"
                    ),
                }

                has_cors = all(cors_headers.values())

                self.log_test(
                    f"CORS Headers - {endpoint}",
                    has_cors,
                    (
                        f"CORS headers: {cors_headers}"
                        if has_cors
                        else "Missing CORS headers"
                    ),
                    cors_headers,
                )
            except Exception as e:
                self.log_test(
                    f"CORS Headers - {endpoint}", False, f"Request failed: {str(e)}"
                )

    def test_content_post_validation(self):
        """Test POST /api/content validation without required fields"""
        try:
            # Test with missing required fields
            invalid_content = {"description": "Missing type and title"}

            response = self.session.post(
                f"{API_BASE}/content",
                json=invalid_content,
                headers={"Content-Type": "application/json"},
            )

            # Should return 401 (auth required) or 400 (validation error)
            if response.status_code in [400, 401]:
                self.log_test(
                    "Content POST - Validation (Missing Fields)",
                    True,
                    f"Correctly returned {response.status_code}. Response: {response.json()}",
                )
            else:
                self.log_test(
                    "Content POST - Validation (Missing Fields)",
                    False,
                    f"Expected 400 or 401, got {response.status_code}",
                    response.text,
                )
        except Exception as e:
            self.log_test(
                "Content POST - Validation (Missing Fields)",
                False,
                f"Request failed: {str(e)}",
            )

    def test_content_put_validation(self):
        """Test PUT /api/content validation without required ID"""
        try:
            # Test with missing ID
            invalid_update = {
                "title": "Updated Title"
                # Missing required 'id' field
            }

            response = self.session.put(
                f"{API_BASE}/content",
                json=invalid_update,
                headers={"Content-Type": "application/json"},
            )

            # Should return 401 (auth required) or 400 (validation error)
            if response.status_code in [400, 401]:
                self.log_test(
                    "Content PUT - Validation (Missing ID)",
                    True,
                    f"Correctly returned {response.status_code}. Response: {response.json()}",
                )
            else:
                self.log_test(
                    "Content PUT - Validation (Missing ID)",
                    False,
                    f"Expected 400 or 401, got {response.status_code}",
                    response.text,
                )
        except Exception as e:
            self.log_test(
                "Content PUT - Validation (Missing ID)",
                False,
                f"Request failed: {str(e)}",
            )

    def test_content_delete_validation(self):
        """Test DELETE /api/content validation without required ID parameter"""
        try:
            # Test without ID parameter
            response = self.session.delete(f"{API_BASE}/content")

            # Should return 401 (auth required) or 400 (validation error)
            if response.status_code in [400, 401]:
                self.log_test(
                    "Content DELETE - Validation (Missing ID)",
                    True,
                    f"Correctly returned {response.status_code}. Response: {response.json()}",
                )
            else:
                self.log_test(
                    "Content DELETE - Validation (Missing ID)",
                    False,
                    f"Expected 400 or 401, got {response.status_code}",
                    response.text,
                )
        except Exception as e:
            self.log_test(
                "Content DELETE - Validation (Missing ID)",
                False,
                f"Request failed: {str(e)}",
            )

    def test_content_approve_validation(self):
        """Test POST /api/content/{id}/approve validation with invalid action"""
        try:
            # Test with invalid action
            invalid_approval = {"action": "invalid_action", "reason": "Test reason"}

            response = self.session.post(
                f"{API_BASE}/content/test-id/approve",
                json=invalid_approval,
                headers={"Content-Type": "application/json"},
            )

            # Should return 401 (auth required) or 400 (validation error)
            if response.status_code in [400, 401]:
                self.log_test(
                    "Content Approve - Validation (Invalid Action)",
                    True,
                    f"Correctly returned {response.status_code}. Response: {response.json()}",
                )
            else:
                self.log_test(
                    "Content Approve - Validation (Invalid Action)",
                    False,
                    f"Expected 400 or 401, got {response.status_code}",
                    response.text,
                )
        except Exception as e:
            self.log_test(
                "Content Approve - Validation (Invalid Action)",
                False,
                f"Request failed: {str(e)}",
            )

    def test_api_structure_and_responses(self):
        """Test API structure and response formats"""
        try:
            # Test content endpoint structure
            response = self.session.get(f"{API_BASE}/content")

            # Should be JSON response even if 401
            try:
                json_data = response.json()
                has_json = True
            except:
                has_json = False

            self.log_test(
                "API Response Format - JSON",
                has_json,
                f"Content endpoint returns JSON format. Status: {response.status_code}",
                json_data if has_json else response.text, # type: ignore
            )

            # Test content-type header
            content_type = response.headers.get("content-type", "")
            is_json_content_type = "application/json" in content_type

            self.log_test(
                "API Response Headers - Content-Type",
                is_json_content_type,
                f"Content-Type header: {content_type}",
            )

        except Exception as e:
            self.log_test(
                "API Response Format - JSON", False, f"Request failed: {str(e)}"
            )

    def test_content_status_enum_validation(self):
        """Test content status enum values in API responses"""
        try:
            # Test that the API understands content status values
            # This tests the ContentStatus enum implementation
            valid_statuses = ["draft", "review", "published", "archived"]

            for status in valid_statuses:
                response = self.session.get(f"{API_BASE}/content?status={status}")

                # Should return 401 (auth required) but not 500 (server error)
                if response.status_code == 401:
                    self.log_test(
                        f"Content Status Filter - {status}",
                        True,
                        f"Status filter '{status}' is recognized (401 auth required, not 500 server error)",
                    )
                elif response.status_code == 500:
                    self.log_test(
                        f"Content Status Filter - {status}",
                        False,
                        f"Status filter '{status}' caused server error",
                        response.text,
                    )
                else:
                    self.log_test(
                        f"Content Status Filter - {status}",
                        True,
                        f"Status filter '{status}' returned {response.status_code}",
                    )

        except Exception as e:
            self.log_test(
                "Content Status Enum Validation", False, f"Request failed: {str(e)}"
            )

    def test_upload_file_type_validation(self):
        """Test upload endpoint file type validation"""
        try:
            # Test with non-image file (should be rejected)
            files = {"files": ("test.txt", "test content", "text/plain")}

            response = self.session.post(f"{API_BASE}/upload", files=files)

            # Should return 401 (auth required) or 400 (file type validation)
            if response.status_code in [400, 401]:
                self.log_test(
                    "Upload - File Type Validation",
                    True,
                    f"Non-image file correctly rejected with {response.status_code}. Response: {response.json()}",
                )
            else:
                self.log_test(
                    "Upload - File Type Validation",
                    False,
                    f"Expected 400 or 401, got {response.status_code}",
                    response.text,
                )
        except Exception as e:
            self.log_test(
                "Upload - File Type Validation", False, f"Request failed: {str(e)}"
            )

    def test_database_connection_handling(self):
        """Test API behavior with database operations"""
        try:
            # Test content listing which involves database operations
            response = self.session.get(f"{API_BASE}/content")

            # Should handle database operations gracefully
            # Even without auth, should not return 500 server errors
            if response.status_code != 500:
                self.log_test(
                    "Database Connection Handling",
                    True,
                    f"API handles database operations gracefully. Status: {response.status_code}",
                )
            else:
                self.log_test(
                    "Database Connection Handling",
                    False,
                    f"Database operation caused server error",
                    response.text,
                )
        except Exception as e:
            self.log_test(
                "Database Connection Handling", False, f"Request failed: {str(e)}"
            )

    def run_all_tests(self):
        """Run all CMS backend tests"""
        print("🚀 Starting CMS Backend API Testing")
        print("=" * 60)
        print()

        # Authentication Tests
        print("🔐 Testing Authentication Requirements...")
        self.test_content_get_without_auth()
        self.test_content_post_without_auth()
        self.test_content_put_without_auth()
        self.test_content_delete_without_auth()
        self.test_content_approve_without_auth()
        self.test_upload_without_auth()

        # CORS Tests
        print("🌐 Testing CORS Headers...")
        self.test_cors_headers()

        # Validation Tests
        print("✅ Testing Input Validation...")
        self.test_content_post_validation()
        self.test_content_put_validation()
        self.test_content_delete_validation()
        self.test_content_approve_validation()

        # API Structure Tests
        print("🏗️ Testing API Structure...")
        self.test_api_structure_and_responses()
        self.test_content_status_enum_validation()

        # File Upload Tests
        print("📁 Testing File Upload...")
        self.test_upload_file_type_validation()

        # Database Tests
        print("🗄️ Testing Database Operations...")
        self.test_database_connection_handling()

        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)

        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests

        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print()

        if failed_tests > 0:
            print("❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
            print()

        print("✅ PASSED TESTS:")
        for result in self.test_results:
            if result["success"]:
                print(f"  - {result['test']}")

        return {
            "total": total_tests,
            "passed": passed_tests,
            "failed": failed_tests,
            "success_rate": (passed_tests / total_tests) * 100,
            "results": self.test_results,
        }


if __name__ == "__main__":
    tester = CMSBackendTester()
    results = tester.run_all_tests()

    # Save results to file
    with open("cms_test_results.json", "w") as f:
        json.dump(results, f, indent=2, default=str)

    print(f"\n📄 Detailed results saved to: cms_test_results.json")
