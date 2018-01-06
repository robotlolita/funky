# Computes the factorial of n
let fact(n):
  if n <= 1 
    then 1
    else fact(n - 1) * n

# Program's entry point
let main(): 
  print(fact(5))