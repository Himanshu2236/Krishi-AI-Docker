"""
PyTorch Convolutional Neural Network (CNN) for Plant Disease Detection
KRISHI AI – Intelligent Agriculture Assistant

Supported Crops:
- Tomato
- Potato
- Pepper (Bell / Chilli)
- Corn (Maize)
- Rice (Paddy)
"""
import torch
import torch.nn as nn
import torch.nn.functional as F

class PlantDiseaseCNN(nn.Module):
    """
    Deep Convolutional Neural Network for multi-class plant disease classification.
    Takes 224x224 RGB leaf images and outputs class logits across 23 disease categories.
    """
    def __init__(self, num_classes=23, dropout_rate=0.4):
        super(PlantDiseaseCNN, self).__init__()
        
        # Conv Block 1: 3 -> 32
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        
        # Conv Block 2: 32 -> 64
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        
        # Conv Block 3: 64 -> 128
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(128)
        
        # Conv Block 4: 128 -> 256
        self.conv4 = nn.Conv2d(128, 256, kernel_size=3, padding=1)
        self.bn4 = nn.BatchNorm2d(256)
        
        # Pooling
        self.pool = nn.MaxPool2d(2, 2)
        self.adaptive_pool = nn.AdaptiveAvgPool2d((4, 4))
        
        # Classifier
        self.dropout = nn.Dropout(dropout_rate)
        self.fc1 = nn.Linear(256 * 4 * 4, 512)
        self.bn_fc = nn.BatchNorm1d(512)
        self.fc2 = nn.Linear(512, num_classes)
        
    def forward(self, x):
        # Block 1: 224 -> 112
        x = self.pool(F.relu(self.bn1(self.conv1(x))))
        # Block 2: 112 -> 56
        x = self.pool(F.relu(self.bn2(self.conv2(x))))
        # Block 3: 56 -> 28
        x = self.pool(F.relu(self.bn3(self.conv3(x))))
        # Block 4: 28 -> 14
        x = self.pool(F.relu(self.bn4(self.conv4(x))))
        
        # Adaptive pool -> 4x4
        x = self.adaptive_pool(x)
        x = torch.flatten(x, 1)
        
        x = F.relu(self.bn_fc(self.fc1(x)))
        x = self.dropout(x)
        logits = self.fc2(x)
        return logits
