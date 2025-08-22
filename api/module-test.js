// Simple module resolution test
module.exports = async (req, res) => {
  const diagnosticInfo = {
    timestamp: new Date().toISOString(),
    node_version: process.version,
    environment: process.env.NODE_ENV || 'development',
    vercel_environment: process.env.VERCEL_ENV,
    module_tests: []
  };
  
  // Test 1: Try to require express
  try {
    diagnosticInfo.module_tests.push({
      name: 'express',
      status: 'started'
    });
    
    const express = require('express');
    diagnosticInfo.module_tests[0].status = 'success';
    diagnosticInfo.module_tests[0].version = express.version;
  } catch (error) {
    diagnosticInfo.module_tests[0].status = 'failed';
    diagnosticInfo.module_tests[0].error = {
      message: error.message,
      name: error.name
    };
  }
  
  // Test 2: Try to require mongoose
  try {
    diagnosticInfo.module_tests.push({
      name: 'mongoose',
      status: 'started'
    });
    
    const mongoose = require('mongoose');
    diagnosticInfo.module_tests[1].status = 'success';
    diagnosticInfo.module_tests[1].version = mongoose.version;
  } catch (error) {
    diagnosticInfo.module_tests[1].status = 'failed';
    diagnosticInfo.module_tests[1].error = {
      message: error.message,
      name: error.name
    };
  }
  
  // Test 3: Try to require mongodb
  try {
    diagnosticInfo.module_tests.push({
      name: 'mongodb',
      status: 'started'
    });
    
    const mongodb = require('mongodb');
    diagnosticInfo.module_tests[2].status = 'success';
    diagnosticInfo.module_tests[2].version = mongodb.version;
  } catch (error) {
    diagnosticInfo.module_tests[2].status = 'failed';
    diagnosticInfo.module_tests[2].error = {
      message: error.message,
      name: error.name
    };
  }
  
  // Test 4: Try to require a local module
  try {
    diagnosticInfo.module_tests.push({
      name: 'local_module_path',
      status: 'started'
    });
    
    // List all available modules in node_modules
    const fs = require('fs');
    const path = require('path');
    
    // Check if we can access the backend directory
    try {
      const backendPath = path.resolve('../backend');
      const backendExists = fs.existsSync(backendPath);
      diagnosticInfo.module_tests[3].backend_path = backendPath;
      diagnosticInfo.module_tests[3].backend_exists = backendExists;
      
      if (backendExists) {
        const backendFiles = fs.readdirSync(backendPath);
        diagnosticInfo.module_tests[3].backend_files = backendFiles;
      }
    } catch (fsError) {
      diagnosticInfo.module_tests[3].fs_error = {
        message: fsError.message,
        name: fsError.name
      };
    }
    
    // Try to require the Student model
    try {
      const Student = require('../backend/models/Student');
      diagnosticInfo.module_tests[3].status = 'success';
      diagnosticInfo.module_tests[3].model_name = Student.modelName;
    } catch (modelError) {
      diagnosticInfo.module_tests[3].status = 'failed';
      diagnosticInfo.module_tests[3].model_error = {
        message: modelError.message,
        name: modelError.name,
        stack: modelError.stack
      };
    }
  } catch (error) {
    diagnosticInfo.module_tests[3].status = 'failed';
    diagnosticInfo.module_tests[3].error = {
      message: error.message,
      name: error.name
    };
  }
  
  return res.status(200).json(diagnosticInfo);
};