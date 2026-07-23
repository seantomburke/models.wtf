# [Models.wtf](http://Models.wtf)

Selecting the right model to use for your AI tasks is cumbersome and requires a lot of in-depth knowledge and understanding about the history of LLMs and the current state of LLMs.

[Models.wtf](http://Models.wtf) aims to simplify this model selection process for the regular user.

## Overview

This repository keeps track of the latest Flagship models from the leading AI companies such as OpenAI, Anthropic, Google, and xAI, as well as other companies and models.

At the simplest level, it shows you the major models, and which one performs better depending on the benchmark.

Benchmarks are also simplified for any user to understand.

Advanced Users will be able to dive into more advanced understanding of Benchmarks and models.

# Goal

Create an easy to use website for any lay person to be able to easily understand what a model is, what an LLM is, and which model they should use for a give task to save costs and get the best performance.

# Requirements

- This will also serve as education for a majority of users that find this reference.
- It will educate them on what an LLM is, what a GPT is, what a Context Window is.
- It will build off of Andrej Karpathy's teachings of complex ideas into simple terms.
- There will be a page with a graph showing different X-axis and Y-axis that can be selected.
- Examples of the Axis that can be selected:
  - Performance of a specific benchmark
  - Cost
- This should feel like an "Explain like I'm 5" page
- There Should also be a flow chart that asks who the user, who they are, what they are planning to do, what cost they want to spend, and which company they prefer, or if they prefer opensource, then tell them which model to use.
  - E.G. Software Engineer, Marketer, Writer, Car Mechanic, etc.
  - Basic roles and titles of every lay person
  - What they plan to do: Build an app, fix a bug, write an email, write a book, etc.
  - Which company: Google, Anthropic, OpenAI, xAI, Open Source
  - An appropriate model for the appropriate task.
- There should also be an opposite decision flow diagram, where you start with the model, and it tells you what tasks you should do with this model and for who.
- Examples: I'm a software engineer, and I want to build an Application, probably use Opus 4.8 with medium effort.
- It should be very interactive.
- If they need internet for their task, they should use a model that has access to the internet.
- If they ask why this model is necessary, we should tell them that some models don't have access to real time data on the internet.
- We should tell them what the difference between a reasoning/thinking model is and a non reasoning/thinking model.
- This page needs to be highly SEO'd so that it shows up first on the Google Search page for terms such as "What is a Model?" "What is GPT?" "Which Model do I use?" "What is an AI model?"

# Sources

We should always be using the most up to date sources to retrieve the latest models released by all major AI LLM players

We should always be using the most up to date sources to retrieve the latest benchmarks that each LLM Model  is tested against.

Data can be stored in a fixed static 

# Technical Requirements 

- For any graphs you should use [https://github.com/tryopendata/openchart](https://github.com/tryopendata/openchart) 
- For any stored data, you can use a static data store method that is fast and local.
- Starting out all data can be hardcoded. Migration to a DataBase solution will come later.
- Deploy this on Github Pages for simplicity.
- Simple HTML files, Tailwind CSS, and React can be used for simplicity.
- No need to use any heavy frameworks starting out.

