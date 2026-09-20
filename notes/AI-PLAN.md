# AI 笔记撰写进度

依据根目录 ai.md 与用户确认的计划。数学暂时留空，将来引用独立数学笔记；重点为 CLIP/VLM 与强化学习。中文讲解、关键推导、具体算例与 Python/NumPy/PyTorch 核心实现并重。

## 第一批：基础入口

- [x] AI 首页、六层结构、两条阅读路线与有内容的模块索引。
- [x] 学习目标：数据、模型与训练。
- [x] 损失函数、经验风险与期望风险。
- [x] 线性回归：最小二乘与梯度下降。
- [x] 逻辑回归与 Softmax 回归。
- [x] 数据划分、交叉验证与数据泄漏。
- [x] 模型评估：回归、分类与检索。
- [x] NumPy 与 PyTorch：张量、梯度与训练。

## 第二批：学习原理与核心机制

- [x] MLE/MAP；泛化与偏差—方差；正则化；优化器；学习率与训练曲线。
- [x] 监督/无监督/自监督；生成与判别；迁移学习；对比学习。
- [x] MLP；计算图与反向传播。
- [x] 初始化；归一化与残差；Embedding。
- [x] CNN 与 ResNet。
- [x] RNN/LSTM/GRU 与 Seq2Seq。
- [x] Q/K/V、缩放点积注意力；多头/掩码/交叉注意力；Transformer；位置编码与 RoPE。

## 第三批：多模态主线

- [x] ViT；图文任务、配对数据与指标。
- [x] CLIP 双编码器、归一化、相似度矩阵、对称损失；零样本分类与检索。
- [x] Tokenization；语言建模与困惑度；BERT/GPT；解码；预训练；SFT；LoRA。
- [x] 图文融合；BLIP/BLIP-2；LLaVA；多模态微调、幻觉与评估。
- [x] CLIP 检索项目；小规模 VLM 微调项目。

## 第四批：强化学习主线

### 基本概念

- [x] Agent–Environment 交互；State/Observation、Action、Reward、Policy；Trajectory、Episode、Horizon、Terminal 与 Return。
- [x] 马尔可夫性、MDP/POMDP；状态转移与奖励模型；折扣回报；状态价值、动作价值、Advantage 与 Bellman 方程。
- [x] Model-Based/Model-Free、On-Policy/Off-Policy、Prediction/Control、探索与利用。

### 基础算法

- [x] 多臂老虎机：增量均值、$\epsilon$-greedy、UCB 与非平稳问题。
- [x] 动态规划：策略评估、策略迭代与价值迭代。
- [x] 无模型预测：Monte Carlo 与 TD(0)。
- [x] 表格型控制：SARSA、Expected SARSA 与 Q-learning。
- [x] 深度强化学习基础：DQN、经验回放与目标网络；REINFORCE 与 Actor–Critic。

### 高级算法与应用

- [ ] 多步学习：$n$-step TD、$n$-step SARSA、TD($\lambda$)、Eligibility Trace 与 Watkins's Q($\lambda$)。
- [ ] DQN 改进：Double DQN、Dueling Network、Prioritized Replay、$n$-step Return、NoisyNet、Distributional DQN 与 Rainbow。
- [ ] 策略优化：Advantage/GAE、重要性采样、TRPO 思路与 PPO。
- [ ] 连续控制：DDPG、TD3 与 SAC。
- [ ] 离线强化学习、模仿学习、RLHF 与 DPO。
- [ ] 项目：表格型控制、DQN 与 PPO 的可复现实验。

## 第五批：其他模型与系统

- [ ] kNN/朴素 Bayes；决策树；随机森林/梯度提升；SVM；K-means；PCA；GMM/EM。
- [ ] 图像预处理；检测/IoU/NMS；语义/实例分割。
- [ ] 自编码器/VAE；GAN；Diffusion；消息传递/GCN/GAT。
- [ ] 语音表示；语音识别/CTC；语音合成。
- [ ] DataLoader；验证/Checkpoint；混合精度；分布式训练/显存。
- [ ] KV Cache；批处理/吞吐/延迟；量化与部署。
- [ ] RAG/重排/引用/评估；Agent 工具调用/状态/终止。
- [ ] Baseline/消融/误差分析/复现；RAG 项目。

## 交付规则

正文只放 notes/docs/AI；本计划不作为网站笔记发布。每个知识点只有一个主要正文位置，交叉内容使用相对链接。未完成主题不创建空正文或无效链接。每个实际目录都有 page: index 的父页，返回上级直接对应文件夹。

每批验证相对链接、Markdown/KaTeX 渲染与代码计算。环境和验证结果随批次记录；不要把阅读器构建成功当成所有正文已验证。保持已有未提交修改，不自动提交 Git。

### 第一批验证记录（2026-09-10）

- 7 篇正文、4 个索引页；数学栏目为空。
- 14 段 Python 代码按页面顺序执行通过。环境：Python 3.10.12、NumPy 2.2.6、PyTorch 2.6.0+cpu。
- 线性回归拟合值、Softmax 概率/损失、划分互斥性、评估算例核验通过；线性回归、二分类和 Softmax 梯度通过有限差分检查。
- 使用阅读器相同的插件流水线检查 11 个页面、206 处公式；无 KaTeX 错误或渲染消息，相对链接和表格列数检查通过。
- 阅读器构建通过；仍有既存的运行时 note.css 引用及大 JS chunk 提示。
- 未进行登录后浏览器截图和打印实测；未修改阅读器、认证或样式。

### 第二批进度：学习原理（2026-09-10）

- 新增 MLE/MAP、泛化与偏差—方差、正则化、优化器、学习率与训练曲线，共 5 篇；AI 当前共有 12 篇正文。
- 新增 13 段 Python 示例；全部 27 段按页面执行通过，沿用第一批 CPU 环境。
- 核验硬币 MLE/MAP/后验均值、偏差—方差恒等式、L1/L2 收缩、Dropout 期望及推理模式、SGD/Momentum/AdaGrad/RMSProp/Adam/AdamW 算例、调度端点和早停轮次。
- 16 个页面、383 处公式的阅读器流水线渲染通过，相对链接、表格列数与 diff 空白检查通过。
- 下一批从学习范式与 MLP、反向传播衔接；数学仍留空。

### 第二批进度：学习范式与神经网络（2026-09-10）

- 新增监督范式、生成与判别、对比学习、迁移学习、MLP、反向传播，共 6 篇；AI 当前共有 18 篇正文、5 个索引页。
- 新增 15 段 Python 示例；全部 42 段在已有 CPU 环境执行通过。
- 核验错位与掩码标签、Bayes 分类、InfoNCE 算例和梯度、双向配对损失、SimCLR 自身屏蔽与标签映射、冻结/解冻实际参数行为、XOR 构造和训练。
- 两层网络所有参数梯度与 PyTorch 自动微分、逐参数有限差分一致；23 页、530 处公式的渲染、链接及表格结构检查通过。
- 下一批继续初始化与梯度传播、归一化与残差、Embedding。未修改数学栏目、阅读器或样式，未提交 Git。

### 第二批进度：初始化与表示（2026-09-10）

- 新增初始化与梯度传播、BatchNorm/LayerNorm/RMSNorm、残差连接、Embedding，共 4 篇；AI 当前共有 22 篇正文、5 个索引页。
- 新增 15 段 Python 示例；全部 57 段在 Python 3.10.12、NumPy 2.2.6、PyTorch 2.6.0+cpu 环境执行通过。
- 核验 Xavier/He 采样尺度、全局梯度裁剪、BatchNorm 训练输出与运行统计量、LayerNorm/RMSNorm、残差分支梯度、Embedding 查表/重复索引/PAD/权重共享。
- 27 页、613 处公式的阅读器流水线渲染通过，相对链接、表格列数与 diff 空白检查通过。
- 下一批继续 CNN 与 ResNet；数学栏目保持为空，未修改阅读器、认证或样式，未提交 Git。

### 第二批进度：CNN 与 ResNet（2026-09-10）

- 新增卷积神经网络、ResNet，共 2 篇；AI 当前共有 24 篇正文、5 个索引页。
- 新增 9 段 Python 示例；全部 66 段在 Python 3.10.12、NumPy 2.2.6、PyTorch 2.6.0+cpu 环境执行通过。
- 核验手算互相关、多通道求和、卷积/池化/全局池化形状、BasicBlock 恒等与投影捷径、Bottleneck 扩展，以及 ResNet-18 四阶段和最终 Logit 形状。
- 29 页、692 处公式的阅读器流水线渲染通过，相对链接、表格列数与 diff 空白检查通过。
- 下一批继续 RNN、LSTM、GRU 与 Seq2Seq；数学栏目保持为空，未提交 Git。

### 第二批进度：循环与序列模型（2026-09-10）

- 新增 RNN/LSTM/GRU、Encoder–Decoder 与 Seq2Seq，共 2 篇；AI 当前共有 26 篇正文、5 个索引页。
- 新增 13 段 Python 示例；全部 79 段在 Python 3.10.12、NumPy 2.2.6、PyTorch 2.6.0+cpu 环境执行通过。
- 核验普通与双向 RNN 状态位置、BPTT 梯度、LSTM/GRU 门控、Teacher Forcing 目标错位、PAD 掩码损失、变长序列打包和贪心解码。
- 31 页、759 处公式的阅读器流水线渲染通过，相对链接、表格列数与 diff 空白检查通过。
- 下一批继续 Attention、Q/K/V、Transformer 与位置编码；数学栏目保持为空，未提交 Git。

### 第二批进度：Attention 与 Transformer（2026-09-10）

- 新增 Attention、Transformer、位置编码与 RoPE，共 3 篇；AI 当前共有 29 篇正文、5 个索引页。
- 新增 13 段 Python 示例；全部 92 段在 Python 3.10.12、NumPy 2.2.6、PyTorch 2.6.0+cpu 环境执行通过。
- 核验缩放点积、Padding/Causal Mask、多头拆分合并、Cross-Attention、Encoder/Decoder Layer、正弦编码与 RoPE 相对位置性质。
- 34 页、829 处公式的阅读器流水线渲染通过，相对链接、表格列数与 diff 空白检查通过。
- 第二批完成；下一批进入 ViT、图文任务与 CLIP。数学栏目保持为空，未提交 Git。

### 第三批进度：ViT 与 CLIP（2026-09-10）

- 新增 ViT、图文任务与 CLIP，共 3 篇正文及领域、计算机视觉、多模态 3 个索引页；AI 当前共有 32 篇正文、8 个索引页。
- 新增 12 段 Python 示例；全部 104 段在 Python 3.10.12、NumPy 2.2.6、PyTorch 2.6.0+cpu 环境执行通过。
- 核验 Patch Projection、分类 Token、二维位置插值、多正样本标签、Recall@K、CLIP 归一化相似度、对称梯度、零样本分类与检索排序。
- 40 页、886 处公式的阅读器流水线渲染通过，相对链接、表格列数与 diff 空白检查通过。
- 下一批进入 Tokenization、语言模型、BERT/GPT、解码与微调；数学栏目保持为空，未提交 Git。

### 第三批进度：语言模型与微调（2026-09-10）

- 新增 Tokenization、语言建模、BERT/GPT、文本生成、预训练/SFT/LoRA，共 5 篇正文及 NLP 索引页；AI 当前共有 37 篇正文、9 个索引页。
- 新增 20 段 Python 示例；全部 124 段在 Python 3.10.12、NumPy 2.2.6、PyTorch 2.6.0+cpu 环境执行通过。
- 核验 BPE 原子词尾、UTF-8 往返、PPL、因果窗口、MLM 标签、BERT/GPT 可见范围、Top-p 边界、Beam Search、SFT 回答掩码和 LoRA 梯度/合并。
- 46 页、953 处公式的阅读器流水线渲染通过，相对链接、表格列数与 diff 空白检查通过。
- 下一批进入图文融合、BLIP/BLIP-2、LLaVA、多模态微调与评估；数学栏目保持为空，未提交 Git。

### 第三批进度：视觉语言模型（2026-09-10）

- 新增图文融合、BLIP/BLIP-2、LLaVA、多模态幻觉与评估，共 4 篇；AI 当前共有 41 篇正文、9 个索引页。
- 新增 9 段 Python 示例；全部 133 段在 Python 3.10.12、NumPy 2.2.6、PyTorch 2.6.0+cpu 环境执行通过。
- 核验 Cross-Attention、视觉前缀、查询瓶颈、ITM、Q-Former 输出、视觉占位替换、Assistant 标签范围和幻觉混淆矩阵。
- 50 页、973 处公式的阅读器流水线渲染通过，相对链接、表格列数与 diff 空白检查通过。
- 下一批完成 CLIP 检索项目与小规模 VLM 微调项目；数学栏目保持为空，未提交 Git。

### 第三批进度：多模态项目（2026-09-10）

- 新增 CLIP 图文检索、小规模 VLM 微调，共 2 篇正文及项目索引页；AI 当前共有 43 篇正文、10 个索引页。
- 新增 6 段 Python 示例；全部 139 段在 Python 3.10.12、NumPy 2.2.6、PyTorch 2.6.0+cpu 环境执行通过。
- 核验批量表示归一化、精确检索排序、一对多 Recall@K、视觉 Projector、Assistant 标签范围和冻结模块梯度。
- 53 页、987 处公式的阅读器流水线渲染通过，相对链接、表格列数与 diff 空白检查通过。
- 第三批完成；下一批进入强化学习主线。数学栏目保持为空，未提交 Git。

### 第四批进度：强化学习基本概念（2026-09-10）

- 新增交互与回报、MDP 与价值函数、问题分类与探索，共 3 篇正文及强化学习索引页；AI 当前共有 46 篇正文、11 个索引页。
- 新增 4 段 Python 示例；全部 143 段在 Python 3.10.12、NumPy 2.2.6、PyTorch 2.6.0+cpu 环境执行通过。
- 核验折扣回报、完整交互轨迹、Bellman 线性方程、On/Off-Policy 重要性采样比率，并区分 Termination 与 Truncation。
- 57 页、1060 处公式的阅读器流水线渲染通过，相对链接、表格列数与 diff 空白检查通过。
- 下一批进入基础算法：多臂老虎机、动态规划、Monte Carlo 与 TD(0)。数学栏目保持为空，未提交 Git。

### 第四批进度：强化学习基础算法（一）（2026-09-10）

- 新增多臂老虎机、动态规划、Monte Carlo/TD(0)，共 3 篇；AI 当前共有 49 篇正文、11 个索引页。
- 新增 12 段 Python 示例；全部 155 段在 Python 3.10.12、NumPy 2.2.6、PyTorch 2.6.0+cpu 环境执行通过。
- 核验样本平均/$\epsilon$-greedy/UCB、非平稳固定步长、策略评估/迭代、价值迭代，以及 Random Walk 的 MC/TD 估计。
- 定值检查发现并修正均匀策略价值的正文手算错误；60 页、1113 处公式的渲染、相对链接、表格与 diff 空白检查通过。
- 下一批进入基础控制算法：SARSA、Expected SARSA 与 Q-learning，随后再写 DQN 和策略梯度。数学栏目保持为空，未提交 Git。

### 第四批进度：强化学习基础算法（二）（2026-09-10）

- 新增表格型控制、DQN、策略梯度与 Actor–Critic，共 3 篇；AI 当前共有 52 篇正文、11 个索引页。
- 表格型控制在同一个悬崖行走环境中对比 SARSA、Expected SARSA 与 Q-learning；DQN 拆解 TD 目标、Replay Buffer 与 Target Network；策略方法覆盖 REINFORCE、Baseline、Advantage、一步 Actor–Critic 与熵奖励。
- 新增 16 段 Python 示例；全部 171 段在 Python 3.10.12、NumPy 2.2.6、PyTorch 2.13.0+cu130 的 CPU 环境执行并通过定值断言。
- 63 页、1180 处公式的阅读器流水线渲染通过，相对链接、表格结构与 diff 空白检查通过；阅读器生产构建通过。
- 下一批进入高级算法：多步学习与 Eligibility Trace，再继续 DQN 改进。数学栏目保持为空，未提交 Git。

## 主要参考资料

- 数学：暂不撰写。
- 基础：CS229、Dive into Deep Learning。
- 视觉：CS231n；语言模型与系统：CS336、Hugging Face LLM Course。
- 多模态：CLIP/LLaVA 原论文及作者代码。
- 强化学习：Sutton/Barto、Spinning Up、CS285。
- 实现：NumPy/PyTorch 官方文档；评估：scikit-learn 官方文档。
