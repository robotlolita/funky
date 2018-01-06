function define(environment, id, value) {
  environment[id] = value;
}

function lookup(environment, id) {
  if (id in environment) {
    return environment[id];
  } else {
    throw new Error(`No variable: ${id}`);
  }
}

// Functions are lexically scoped. What this means is that
// the scope of the body is defined at the time the function
// is created, not when it's called. So we store the
// environment at the time the function was constructed here.
//
// When invoking a function, we *clone* its original environment
// and bind the parameters to the provided values in this new
// environment, so the body can refer to those values.
// JS happens to make this efficient by using prototype-based
// inheritance, where we don't actually copy anything in memory,
// just maintain a pointer to the original environment.
function createFunction(environment, params, body) {
  return (args) => {
    const newEnvironment = Object.create(environment);
    params.forEach((param, i) => 
      define(newEnvironment, param, args[i])
    );
    return evaluate(body, newEnvironment);
  };
}

const baseEnvironment = {
  print([value]) {
    console.log(value);
    return value;
  }
};

function evaluate(node, environment = baseEnvironment) {
  switch (node[0]) {
    case 'prog': {
      const [_, declarations] = node;
      const programEnv = Object.create(environment);
      declarations.forEach(x => evaluate(x, programEnv));
      programEnv['main']();
      break;
    }
    
    case 'fun': {
      const [_, id, params, body] = node;
      define(environment, id, createFunction(environment, params, body));
      break;
    }

    case 'if': {
      const [_, test, ifTrue, ifFalse] = node;
      if (evaluate(test, environment)) {
        return evaluate(ifTrue, environment);
      } else {
        return evaluate(ifFalse, environment);
      }
    }

    case 'op': {
      const [_, op, left, right] = node;
      const l = evaluate(left, environment);
      const r = evaluate(right, environment);
      switch (op) {
        case '=':  return l === r;
        case '<>': return l !== r;
        case '<=': return l <= r;
        case '>=': return l >= r;
        case '<':  return l < r;
        case '>':  return l > r;
        case '+':  return l + r;
        case '-':  return l - r;
        case '*':  return l * r;
        case '/':  return l / r;
        default:
          throw new Error(`Unknown operator: ${op}`);
      }
    }

    case 'call': {
      const [_, calleeNode, argNodes] = node;
      const callee = evaluate(calleeNode, environment);
      const args = argNodes.map(x => evaluate(x, environment));
      return callee(args);
    }

    case 'num': {
      return Number(node[1]);
    }

    case 'bool': {
      switch (node[1]) {
        case 'true': return true;
        case 'false': return false;
        default:
          throw new Error(`Invalid boolean: ${node[1]}`);
      }
    }

    case 'var': {
      return lookup(environment, node[1]);
    }
  }
}

module.exports = { evaluate };
