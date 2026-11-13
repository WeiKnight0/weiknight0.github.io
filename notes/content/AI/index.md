---
title: AI 人工智能
date: 2026-09-10T00:00:00
lang: zh-cn
page: index
---

## 数学与计算基础

## 机器学习基本原理

- [学习目标：数据、模型与训练](learning-principles/learning-objectives.md)
- [损失函数、经验风险与期望风险](learning-principles/loss-and-risk.md)
- [参数估计：最大似然与最大后验](learning-principles/mle-and-map.md)
- [泛化、欠拟合与偏差—方差](learning-principles/generalization.md)
- [正则化：L1、L2、Dropout 与数据增强](learning-principles/regularization.md)
- [优化器：SGD、Momentum、Adam 与 AdamW](learning-principles/optimizers.md)
- [学习率、批量大小与训练曲线](learning-principles/learning-rate-and-training.md)
- [数据划分、交叉验证与数据泄漏](learning-principles/data-splitting.md)
- [模型评估：回归、分类与检索](learning-principles/evaluation.md)

## 学习范式

- [学习范式：监督、无监督、自监督与强化学习](learning-paradigms/supervision.md)
- [生成建模与判别建模](learning-paradigms/generative-and-discriminative.md)
- [对比学习：正负样本、温度与 InfoNCE](learning-paradigms/contrastive-learning.md)
- [迁移学习：预训练、冻结与微调](learning-paradigms/transfer-learning.md)

## 模型结构与机制

- [线性回归：最小二乘与梯度下降](models/linear-regression.md)
- [逻辑回归与 Softmax 回归](models/logistic-and-softmax-regression.md)
- [多层感知机：线性层、激活与前向传播](models/mlp.md)
- [计算图、链式法则与反向传播](models/backpropagation.md)
- [初始化与梯度传播：Xavier、He 与梯度裁剪](models/initialization.md)
- [归一化：BatchNorm、LayerNorm 与 RMSNorm](models/normalization.md)
- [残差连接：恒等路径、投影与归一化位置](models/residual-connections.md)
- [Embedding：查表、梯度与表示空间](models/embedding.md)
- [卷积神经网络：卷积、步幅、填充与池化](models/convolutional-neural-networks.md)
- [ResNet：残差块、阶段结构与下采样](models/resnet.md)
- [循环神经网络：RNN、LSTM、GRU 与 BPTT](models/recurrent-neural-networks.md)
- [Encoder–Decoder 与 Seq2Seq：训练、掩码与生成](models/sequence-to-sequence.md)
- [Attention：Q/K/V、掩码与多头注意力](models/attention.md)
- [Transformer：层结构、Encoder 与 Decoder](models/transformer.md)
- [位置编码：绝对位置、正弦编码与 RoPE](models/positional-encoding.md)

## 领域与算法

- [计算机视觉](domains/computer-vision/)
- [Vision Transformer：图像分块与编码](domains/computer-vision/vit.md)
- [多模态学习](domains/multimodal/)
- [图文任务：配对数据与评估](domains/multimodal/image-text-tasks.md)
- [CLIP：图文对齐、零样本分类与检索](domains/multimodal/clip.md)
- [图文融合：双编码器、Cross-Attention 与视觉 Token](domains/multimodal/fusion-architectures.md)
- [BLIP 与 BLIP-2：统一图文预训练和 Q-Former](domains/multimodal/blip.md)
- [LLaVA：视觉 Projector 与多模态指令微调](domains/multimodal/llava.md)
- [多模态幻觉与评估](domains/multimodal/hallucination-evaluation.md)
- [自然语言处理与语言模型](domains/nlp/)
- [Tokenization：文本、子词与 Token ID](domains/nlp/tokenization.md)
- [语言建模：下一个 Token 与困惑度](domains/nlp/language-modeling.md)
- [BERT 与 GPT：双向编码和因果生成](domains/nlp/bert-and-gpt.md)
- [文本生成：Greedy、Beam Search 与采样](domains/nlp/decoding.md)
- [预训练、SFT 与 LoRA](domains/nlp/pretraining-sft-lora.md)
- [强化学习](domains/reinforcement-learning/)
- [Agent–Environment 交互、轨迹与回报](domains/reinforcement-learning/interaction-and-return.md)
- [MDP、价值函数与 Bellman 方程](domains/reinforcement-learning/mdp-and-value.md)
- [强化学习问题分类与探索](domains/reinforcement-learning/problem-settings.md)
- [多臂老虎机：估计、探索与 UCB](domains/reinforcement-learning/multi-armed-bandits.md)
- [动态规划：策略评估、策略迭代与价值迭代](domains/reinforcement-learning/dynamic-programming.md)
- [无模型预测：Monte Carlo 与 TD(0)](domains/reinforcement-learning/monte-carlo-and-td.md)

## 系统与实践

- [NumPy 与 PyTorch：张量、梯度与训练](systems/numpy-and-pytorch.md)
- [AI 项目实践](projects/)
- [CLIP 图文检索项目](projects/clip-retrieval.md)
- [小规模视觉语言模型微调项目](projects/small-vlm-finetuning.md)

## 阅读路线

### 共同基础

1. [学习目标](learning-principles/learning-objectives.md)
2. [损失与风险](learning-principles/loss-and-risk.md)
3. [NumPy 与 PyTorch](systems/numpy-and-pytorch.md)
4. [线性回归](models/linear-regression.md)
5. [逻辑回归与 Softmax](models/logistic-and-softmax-regression.md)
6. [数据划分](learning-principles/data-splitting.md)与[模型评估](learning-principles/evaluation.md)

### 多模态

共同基础 → [MLP](models/mlp.md)与[反向传播](models/backpropagation.md) → [Attention](models/attention.md) 与 [Transformer](models/transformer.md) → [对比学习](learning-paradigms/contrastive-learning.md)与 [ViT](domains/computer-vision/vit.md) → [CLIP](domains/multimodal/clip.md) → 图文检索 → LLaVA → 多模态微调与评估。

### 强化学习

共同基础 → 强化学习基本概念 → 基础算法（Bandit、动态规划、MC/TD、SARSA/Q-learning、DQN、策略梯度）→ 高级算法（多步学习、DQN 改进、PPO、连续控制、离线 RL 与 RLHF）。

- [表格型控制：SARSA、Expected SARSA 与 Q-learning](domains/reinforcement-learning/tabular-control.md)
- [DQN：经验回放与目标网络](domains/reinforcement-learning/dqn.md)
- [策略梯度：REINFORCE 与 Actor–Critic](domains/reinforcement-learning/policy-gradient-and-actor-critic.md)
