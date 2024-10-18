import ast
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import RobertaTokenizer, RobertaForSequenceClassification, GPT2Tokenizer, GPT2LMHeadModel
import torch

app = Flask(__name__)
CORS(app)

class CodeCommentGenerator:
    def __init__(self):
        # Load CodeBERT model for understanding code
        self.code_tokenizer = RobertaTokenizer.from_pretrained('microsoft/codebert-base')
        self.code_model = RobertaForSequenceClassification.from_pretrained('microsoft/codebert-base', num_labels=1)

        # Load GPT-2 model for generating comments
        self.comment_tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
        self.comment_model = GPT2LMHeadModel.from_pretrained('gpt2')

    def generate_comment(self, code_snippet):
        # Prepare the input for CodeBERT
        inputs = self.code_tokenizer.encode(code_snippet, return_tensors='pt', truncation=True)

        # Use CodeBERT to analyze the code
        with torch.no_grad():
            outputs = self.code_model(inputs)
            logits = outputs.logits

        # Generate a comment based on CodeBERT analysis
        comment = self.extract_comment_from_logits(logits, code_snippet)

        # Insert the generated comment into the code snippet
        updated_code = f"# {comment}\n{code_snippet}"
        return updated_code

    def extract_comment_from_logits(self, logits, code_snippet):
        prompt = (f"Given the following code snippet, provide a detailed comments inside code describing its purpose and functionality:\n\n"
                          f"{code_snippet.strip()}\n\n"
                          "Comment:")

        input_ids = self.comment_tokenizer.encode(prompt, return_tensors='pt')


        with torch.no_grad():
            output = self.comment_model.generate(input_ids, max_new_tokens=30, num_return_sequences=1)

        comment = self.comment_tokenizer.decode(output[0], skip_special_tokens=True)

        # Clean up the comment by removing the prompt part
        start_idx = comment.find("Comment:") + len("Comment:")
        comment = comment[start_idx:].strip()

        # Ensure we focus only on the comment related to the function
        return comment


@app.route('/generate-comment', methods=['POST'])
def comment_endpoint():
    # Get code from the request
    code_snippet = request.json.get('code', '')
    
    # Generate comment
    generator = CodeCommentGenerator()
    updated_code = generator.generate_comment(code_snippet)

    return jsonify({"comment": updated_code})

if __name__ == '__main__':
    app.run(port=5000)
