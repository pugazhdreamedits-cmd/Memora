// ============================================================
// MEMORA — Quiz Question Bank
// ============================================================

import type { QuizQuestion, Difficulty } from "@/types";
import { generateId, shuffleArray } from "@/lib/utils";

type QuestionTemplate = Omit<QuizQuestion, "id">;

const QUESTION_BANK: Record<string, QuestionTemplate[]> = {
  "Python Lists": [
    { text: "Which method adds an element to the end of a Python list?", options: ["insert()", "append()", "add()", "push()"], correctIndex: 1, topic: "Python Lists", difficulty: "Easy" },
    { text: "What does list.pop() return?", options: ["The first element", "Nothing", "The last element and removes it", "A copy of the list"], correctIndex: 2, topic: "Python Lists", difficulty: "Easy" },
    { text: "Which of the following creates a shallow copy of a list?", options: ["list.copy()", "list[::]", "list[:]", "Both A and C"], correctIndex: 3, topic: "Python Lists", difficulty: "Medium" },
    { text: "What is the time complexity of list.append() in Python?", options: ["O(n)", "O(log n)", "O(1) amortized", "O(n²)"], correctIndex: 2, topic: "Python Lists", difficulty: "Medium" },
    { text: "What does list comprehension [x**2 for x in range(5)] produce?", options: ["[1,4,9,16,25]", "[0,1,4,9,16]", "[0,1,2,3,4]", "[1,2,3,4,5]"], correctIndex: 1, topic: "Python Lists", difficulty: "Easy" },
    { text: "What is the result of [1,2,3] + [4,5]?", options: ["[1,2,3,4,5]", "Error", "[5,7,3]", "[1,2,3,[4,5]]"], correctIndex: 0, topic: "Python Lists", difficulty: "Easy" },
  ],
  "Linear Regression": [
    { text: "What does the coefficient of determination (R²) measure?", options: ["The slope of the line", "The proportion of variance explained by the model", "The number of features", "The error rate"], correctIndex: 1, topic: "Linear Regression", difficulty: "Medium" },
    { text: "Which assumption is required for linear regression?", options: ["Non-linearity", "Homoscedasticity", "Multicollinearity", "Random forests"], correctIndex: 1, topic: "Linear Regression", difficulty: "Hard" },
    { text: "What is the goal of Ordinary Least Squares (OLS)?", options: ["Maximize residuals", "Minimize mean absolute error", "Minimize sum of squared residuals", "Maximize R²"], correctIndex: 2, topic: "Linear Regression", difficulty: "Medium" },
    { text: "True or False: Linear regression can only model linear relationships.", options: ["True", "False (polynomial features extend it)", "Only with one feature", "Only with log transformation"], correctIndex: 1, topic: "Linear Regression", difficulty: "Easy" },
    { text: "What does a high VIF (>10) indicate?", options: ["Good model fit", "Multicollinearity problem", "Overfitting", "Underfitting"], correctIndex: 1, topic: "Linear Regression", difficulty: "Hard" },
  ],
  "Neural Networks": [
    { text: "What is the role of an activation function in a neural network?", options: ["Initialize weights", "Introduce non-linearity", "Reduce learning rate", "Split the dataset"], correctIndex: 1, topic: "Neural Networks", difficulty: "Medium" },
    { text: "Which activation function suffers from the 'vanishing gradient' problem?", options: ["ReLU", "Leaky ReLU", "Sigmoid", "ELU"], correctIndex: 2, topic: "Neural Networks", difficulty: "Hard" },
    { text: "What does backpropagation compute?", options: ["Forward pass outputs", "Gradients of loss w.r.t. weights", "The learning rate", "Layer activations"], correctIndex: 1, topic: "Neural Networks", difficulty: "Hard" },
    { text: "True or False: A neural network with no hidden layers is equivalent to logistic regression.", options: ["True", "False", "Only for binary tasks", "Only for linear data"], correctIndex: 0, topic: "Neural Networks", difficulty: "Medium" },
    { text: "What technique helps prevent overfitting in neural networks?", options: ["Increasing learning rate", "Dropout", "Using sigmoid everywhere", "Removing all hidden layers"], correctIndex: 1, topic: "Neural Networks", difficulty: "Medium" },
  ],
  "Pandas DataFrames": [
    { text: "Which method displays the first 5 rows of a DataFrame?", options: ["df.tail()", "df.head()", "df.top()", "df.show()"], correctIndex: 1, topic: "Pandas DataFrames", difficulty: "Easy" },
    { text: "How do you select a single column 'age' from df?", options: ["df.age", "df['age']", "df.select('age')", "Both A and B"], correctIndex: 3, topic: "Pandas DataFrames", difficulty: "Easy" },
    { text: "What does df.groupby('col').agg({'val':'mean'}) do?", options: ["Sorts by col", "Groups and computes mean of val per group", "Filters rows", "Merges DataFrames"], correctIndex: 1, topic: "Pandas DataFrames", difficulty: "Medium" },
    { text: "What method fills missing values with a specified value?", options: ["df.drop_na()", "df.fillna()", "df.impute()", "df.replace_nan()"], correctIndex: 1, topic: "Pandas DataFrames", difficulty: "Easy" },
    { text: "What does df.merge(other, on='key', how='left') perform?", options: ["Inner join", "Right join", "Left join", "Cross join"], correctIndex: 2, topic: "Pandas DataFrames", difficulty: "Medium" },
  ],
  "Decision Trees": [
    { text: "What criterion does CART use to split nodes?", options: ["Information Gain", "Gini Impurity", "Chi-square", "Variance"], correctIndex: 1, topic: "Decision Trees", difficulty: "Medium" },
    { text: "What is pruning in decision trees?", options: ["Adding more nodes", "Removing nodes to reduce overfitting", "Increasing tree depth", "Normalizing features"], correctIndex: 1, topic: "Decision Trees", difficulty: "Medium" },
    { text: "Which of the following is a disadvantage of decision trees?", options: ["Non-interpretable", "Cannot handle categorical data", "Prone to overfitting", "Requires feature scaling"], correctIndex: 2, topic: "Decision Trees", difficulty: "Easy" },
    { text: "True or False: Decision trees require feature normalization.", options: ["True", "False — they are scale-invariant", "Only for numeric features", "Only for regression"], correctIndex: 1, topic: "Decision Trees", difficulty: "Easy" },
    { text: "What is the Gini impurity of a pure node?", options: ["1", "0.5", "0", "0.25"], correctIndex: 2, topic: "Decision Trees", difficulty: "Hard" },
  ],
  "Binary Trees": [
    { text: "What is the maximum number of nodes at level L of a binary tree?", options: ["L", "2^L", "L²", "2L"], correctIndex: 1, topic: "Binary Trees", difficulty: "Medium" },
    { text: "Which traversal visits: Left → Root → Right?", options: ["Pre-order", "In-order", "Post-order", "Level-order"], correctIndex: 1, topic: "Binary Trees", difficulty: "Easy" },
    { text: "A complete binary tree has all levels full except possibly the last, filled from left. True or False?", options: ["True", "False", "Only for heaps", "Only for BSTs"], correctIndex: 0, topic: "Binary Trees", difficulty: "Easy" },
    { text: "What is the height of a balanced binary tree with n nodes?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correctIndex: 1, topic: "Binary Trees", difficulty: "Medium" },
    { text: "In a BST, where is the minimum element located?", options: ["Root", "Leftmost node", "Rightmost node", "Random leaf"], correctIndex: 1, topic: "Binary Trees", difficulty: "Easy" },
  ],
  "default": [
    { text: "What does 'supervised learning' mean in machine learning?", options: ["Training without labels", "Training with labeled examples", "Unsupervised clustering", "Reinforcement learning"], correctIndex: 1, topic: "General", difficulty: "Easy" },
    { text: "What is overfitting?", options: ["Model performs poorly on training data", "Model learns noise and fails to generalize", "Model has too few parameters", "Model underfits the training data"], correctIndex: 1, topic: "General", difficulty: "Easy" },
    { text: "Which metric is best for imbalanced classification?", options: ["Accuracy", "F1 Score", "Simple error rate", "Mean squared error"], correctIndex: 1, topic: "General", difficulty: "Medium" },
    { text: "What is cross-validation used for?", options: ["Training faster", "Evaluating model generalization", "Feature selection only", "Hyperparameter initialization"], correctIndex: 1, topic: "General", difficulty: "Medium" },
    { text: "What does normalization do to features?", options: ["Removes outliers", "Scales features to a common range", "Adds noise", "Encodes categoricals"], correctIndex: 1, topic: "General", difficulty: "Easy" },
    { text: "What is the purpose of a train/test split?", options: ["Speed up training", "Evaluate on unseen data", "Reduce dataset size", "Prevent normalization"], correctIndex: 1, topic: "General", difficulty: "Easy" },
  ],
};

export function getQuizQuestions(topic: string, count = 5): QuizQuestion[] {
  const bank = QUESTION_BANK[topic] ?? QUESTION_BANK["default"];
  const selected = shuffleArray(bank).slice(0, Math.min(count, bank.length));
  return selected.map(q => ({ ...q, id: generateId() }));
}

export function scoreQuiz(questions: QuizQuestion[], answers: number[]): {
  score: number;
  accuracy: number;
  correct: number;
  total: number;
} {
  const correct = questions.filter((q, i) => q.correctIndex === answers[i]).length;
  return {
    score: Math.round((correct / questions.length) * 100),
    accuracy: correct / questions.length,
    correct,
    total: questions.length,
  };
}
