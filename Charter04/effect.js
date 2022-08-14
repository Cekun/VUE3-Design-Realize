// 存储副作用函数的桶
const bucket = new WeakMap()

let activeEffect

function effect(fn) {
  activeEffect = fn
  fn()
}

const obj = new Proxy(data, {
  get(target, key) {
    track(target, key)
    return target[key]
  },
  set(target, key, newVal) {
    // 设置属性值
    target[key] = newVal
    // 把副作用从桶里取出来并执行
    trigger(target, key)
  }
})

function track(target, key) {
  // 没有activeEffet,直接return
  if(!activeEffect) return 
  // 根据target从桶中取得depsMap, 它也是一个 Map 类型：key --> effects
  let depsMap = bucket.get(target)
  // 如果不存在depsMap， 那么新建一个Map 并与 target 关联
  if(!depsMap)
    bucket.set(target, depsMap = new Map()) 
  // 再根据key 从 depsMap 中取得deps, 它是一个Set 类型，
  // 里面存储着所有与当前 key 相关联的副作用函数： effects
  let deps = depsMap.get(target)
  // 如果 deps 不存在，同样新建一个Set 并与key 关联
  if(!deps) 
    depsMap.set(key, (deps = new Set()))
  // 最后将当前激活的副作用函数添加到桶里
  deps.add(activeEffect)

}

function trigger(target, key) {
  // 根据target从桶中取得depsMap, 它也是一个 Map 类型：key --> effects
  const depsMap = bucket.get(target)
  if(!depsMap) return 
  // 根据key取得所有副作用函数effects
  const effects = depsMap.get(key)
  effects && effects.forEach(fn => fn())
}