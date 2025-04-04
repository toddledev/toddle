import {
  absoluteSize,
  angleUnits,
  attachmentBg,
  colorFunction,
  fontStretchValues,
  genericFonts,
  hueInterpolationMethod,
  imageBg,
  lengthUnits,
  lineStyle,
  outlineStyle,
  polarColorSpace,
  positionBg,
  rectangularColorSpace,
  relativeSize,
  repeatStyle,
  sizeBg,
  textDecorationLine,
  textDecorationStyleValues,
  timeUnits,
  timingFunctions,
  visualBoxBg,
} from './const'

// TODO: enable these rules when we improve type safety
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable max-params */
/* eslint-disable prefer-const */
export const parseCss = (args: {
  variables?: Record<string, string>
  style: Record<string, any>
}) => {
  const variables = args.variables
    ? Object.values(args.variables).flatMap((v) => v)
    : []
  const parseRepeat = (repeat: any) => {
    if (!repeat) {
      return null
    }
    if (repeat.length === 1) {
      if (repeat[0].value === 'repeat-x') {
        return {
          horizontal: {
            type: 'keyword',
            value: 'repeat',
          },
          vertical: {
            type: 'keyword',
            value: 'no-repeat',
          },
        }
      }
      if (repeat[0].value === 'repeat-y') {
        return {
          horizontal: {
            type: 'keyword',
            value: 'no-repeat',
          },
          vertical: {
            type: 'keyword',
            value: 'repeat',
          },
        }
      }
      if (repeat[0].value === 'initial') {
        return {
          horizontal: {
            type: 'keyword',
            value: 'repeat',
          },
          vertical: {
            type: 'keyword',
            value: 'repeat',
          },
        }
      }
      return {
        horizontal: {
          type: 'keyword',
          value: repeat[0].value,
        },
        vertical: {
          type: 'keyword',
          value: repeat[0].value,
        },
      }
    }

    return {
      horizontal: {
        type: 'keyword',
        value: repeat[0].value,
      },
      vertical: {
        type: 'keyword',
        value: repeat[1].value,
      },
    }
  }

  const getValue = (value?: any, splitValues?: any) => {
    if (!value) {
      return null
    }

    switch (value.type) {
      case 'block':
        return value.nodes.length > 0
          ? value.nodes.map((v: any) => {
              return getValue(v, splitValues)
            })
          : null
      case 'function':
        if (splitValues) {
          const values =
            value.nodes.length > 0
              ? value.nodes.map((v: any) => {
                  return getValue(v, false)
                })
              : null
          return { type: value.type, name: value.value, value: values }
        } else {
          let fValue = ''

          value.nodes.map((v: any, i: number) => {
            fValue += getValue(v).value
            if (i < value.nodes.length - 1) {
              fValue += ', '
            }
          })
          return { type: value.type, name: value.value, value: fValue }
        }
      case 'string':
        return { type: value.type, value: value.value }
      default:
        return { value: value.value }
    }
  }

  const parseMultipleValues = (values: any) => {
    if (!values) {
      return null
    }
    return values.map((v: any) => {
      const type = v.type
      const value = v.value
      if (Array.isArray(value)) {
        const args = value.map((val) => {
          return parseMultipleValues([val])[0]
        })

        return {
          type,
          name: v.name,
          arguments: args,
        }
      } else if (typeof value === 'string' && value !== '') {
        if (type) {
          const parsedVal: any = {
            type,
            value,
          }
          if (v.name) {
            parsedVal.name = v.name
          }
          return parsedVal
        }

        if (isColor(value) && value.charAt(0) === '#') {
          return { type: 'hex', value }
        }

        // if it's not only numbers and is alfanumeric and does not start with number
        if (
          !Number.parseFloat(value) &&
          /^[a-z0-9-]+$/gi.test(value) &&
          !/^\d/.test(value)
        ) {
          return { type: 'keyword', value }
        }

        // if it's slash
        if (value === '/') {
          return { type: 'slash', value }
        }

        // if it's not alphabetic only then we want to split the number from the unit
        const split: any = value.match(/^([-.\d]+(?:\.\d+)?)(.*)$/)
        const val: any = split?.[1].trim()
        const unit: any =
          split?.[2].trim() === '' ? 'number' : split?.[2].trim()

        if (unit === 'number') {
          return {
            type: 'number',
            value: val,
          }
        }
        if (lengthUnits.includes(unit)) {
          return {
            type: 'length',
            value: val,
            unit,
          }
        }
        if (timeUnits.includes(unit)) {
          return {
            type: 'time',
            value: val,
            unit,
          }
        }
        if (angleUnits.includes(unit)) {
          return {
            type: 'angle',
            value: val,
            unit,
          }
        }

        console.error('Invalid unit: ', unit)
        return {}
      } else if (typeof value === 'number') {
        return {
          type: 'number',
          value: value.toString(),
        }
      } else {
        console.error('Invalid value: ', value)
        return {}
      }
    })
  }

  const parseTransformAll = (transform: any) => {
    if (!transform) {
      return null
    }
    const allTransforms: any[] = []

    // Get the rotate from the transform property
    const rotates = transform.filter((t: any) => t.name.includes('rotate'))

    rotates.map((r: any) => {
      switch (r.name) {
        case 'rotate3d':
          allTransforms.push({
            [r.name]: {
              x: r.arguments[0],
              y: r.arguments[1],
              z: r.arguments[2],
              angle: r.arguments[3],
            },
          })
          break
        case 'rotateX':
          allTransforms.push({
            [r.name]: {
              angle: r.arguments[0],
            },
          })
          break
        case 'rotateY':
          allTransforms.push({
            [r.name]: {
              angle: r.arguments[0],
            },
          })
          break
        case 'rotateZ':
          allTransforms.push({
            [r.name]: {
              angle: r.arguments[0],
            },
          })
          break
        case 'rotate':
          allTransforms.push({
            [r.name]: {
              angle: r.arguments[0],
            },
          })
          break
      }
    })

    // Get the translate from the transform property
    const translates = transform.filter((t: any) =>
      t.name.includes('translate'),
    )

    translates.map((t: any) => {
      switch (t.name) {
        case 'translate3d':
          allTransforms.push({
            [t.name]: {
              x: t.arguments[0],
              y: t.arguments[1],
              z: t.arguments[2],
            },
          })
          break
        case 'translateX':
          allTransforms.push({
            [t.name]: {
              x: t.arguments[0],
            },
          })
          break
        case 'translateY':
          allTransforms.push({
            [t.name]: {
              y: t.arguments[0],
            },
          })
          break
        case 'translateZ':
          allTransforms.push({
            [t.name]: {
              z: t.arguments[0],
            },
          })
          break
        case 'translate':
          allTransforms.push({
            [t.name]: {
              x: t.arguments[0],
              y: t.arguments?.[1] ?? 0,
            },
          })
          break
      }
    })

    // Get the scale from the transform property
    const scales = transform.filter((t: any) => t.name.includes('scale'))

    scales.map((scale: any) => {
      switch (scale.name) {
        case 'scale3d':
          allTransforms.push({
            [scale.name]: {
              x: scale.arguments[0],
              y: scale.arguments[1],
              z: scale.arguments[2],
            },
          })
          break
        case 'scaleX':
          allTransforms.push({
            [scale.name]: {
              x: scale.arguments[0],
            },
          })
          break
        case 'scaleY':
          allTransforms.push({
            [scale.name]: {
              y: scale.arguments[0],
            },
          })
          break
        case 'scaleZ':
          allTransforms.push({
            [scale.name]: {
              z: scale.arguments[0],
            },
          })
          break
        case 'scale':
          allTransforms.push({
            [scale.name]: {
              x: scale.arguments[0],
              y: scale.arguments?.[1] ?? scale.arguments[0],
            },
          })
          break
      }
    })

    // Get the skew from the transform property
    const skews = transform.filter((t: any) => t.name.includes('skew'))

    skews.map((skew: any) => {
      switch (skew.name) {
        case 'skew':
          allTransforms.push({
            [skew.name]: {
              x: skew.arguments[0],
              y: skew.arguments?.[1] ?? skew.arguments[0],
            },
          })
          break
        case 'skewX':
          allTransforms.push({
            [skew.name]: {
              x: skew.arguments[0],
            },
          })
          break
        case 'skewY':
          allTransforms.push({
            [skew.name]: {
              y: skew.arguments[0],
            },
          })
          break
      }
    })

    // Get the matrix from the transform property
    const matrixs = transform.filter((t: any) => t.name.includes('matrix'))

    matrixs.map((matrix: any) => {
      switch (matrix.name) {
        case 'matrix3d':
          allTransforms.push({
            [matrix.name]: {
              a1: matrix.arguments[0],
              b1: matrix.arguments[1],
              c1: matrix.arguments[2],
              d1: matrix.arguments[3],
              a2: matrix.arguments[4],
              b2: matrix.arguments[5],
              c2: matrix.arguments[6],
              d2: matrix.arguments[7],
              a3: matrix.arguments[8],
              b3: matrix.arguments[9],
              c3: matrix.arguments[10],
              d3: matrix.arguments[11],
              a4: matrix.arguments[12],
              b4: matrix.arguments[13],
              c4: matrix.arguments[14],
              d4: matrix.arguments[15],
            },
          })
          break
        case 'matrix':
          allTransforms.push({
            [matrix.name]: {
              a: matrix.arguments[0],
              b: matrix.arguments[1],
              c: matrix.arguments[2],
              d: matrix.arguments[3],
              x: matrix.arguments[4],
              y: matrix.arguments[5],
            },
          })
          break
      }
    })

    // Get the perspective from the transform property
    const perspectives = transform.filter((t: any) =>
      t.name.includes('perspective'),
    )

    perspectives.map((perspective: any) => {
      allTransforms.push({
        [perspective.name]: { distance: perspective.arguments[0] },
      })
    })

    return allTransforms
  }

  const parseLinearGradient = (values: any) => {
    const parsedValues = parseMultipleValues(values[0].value)
    let direction: any = {}
    let stops: any = []
    let interpolation: any = {}

    parsedValues.map((arg: any) => {
      if (arg.type === 'keyword') {
        if (arg.value === 'to') {
          direction.type = 'keyword'
          direction.value = 'to'
        } else if (['top', 'bottom', 'left', 'right'].includes(arg.value)) {
          direction.value += ` ${arg.value}`
        } else if (arg.value === 'in') {
          interpolation.type = 'string'
          interpolation.value = 'in'
        } else if (
          rectangularColorSpace.includes(arg.value) ||
          polarColorSpace.includes(arg.value) ||
          hueInterpolationMethod.includes(arg.value)
        ) {
          interpolation.value += ` ${arg.value}`
        } else {
          // this should be color like red, blue....
          stops[stops.length] = {
            color: arg,
          }
        }
      } else if (arg.type === 'angle') {
        direction = arg
      } else if (arg.type === 'length') {
        if (stops[stops.length - 1].position) {
          stops[stops.length - 1].midpoint = arg
        } else {
          stops[stops.length - 1].position = arg
        }
      } else if (arg.type === 'hex') {
        stops[stops.length] = {
          color: arg,
        }
      } else if (arg.type === 'function') {
        // this should be the color using functions
        stops[stops.length] = {
          color: arg,
        }
      }
    })

    return {
      type: 'function',
      name: values[0].name,
      direction,
      stops,
      interpolation,
    }
  }

  const parseConicGradient = (values: any) => {
    const parsedValues = parseMultipleValues(values[0].value)
    let angle: any = {}
    let position: any = {}
    let stops: any = []
    let interpolation: any = {}

    parsedValues.map((arg: any) => {
      if (arg.type === 'keyword') {
        // eslint-disable-next-line no-empty
        if (arg.value === 'from' || arg.value === 'at') {
          // do nothing atm
        } else if (['top', 'bottom', 'left', 'right'].includes(arg.value)) {
          if (!position.x && !position.y) {
            position = {
              x: {},
              y: {},
            }
          }
          if (position.x?.align) {
            position.y.align = arg
          } else {
            position.x.align = arg
          }
        } else if (arg.value === 'in') {
          interpolation.type = 'string'
          interpolation.value = 'in'
        } else if (
          rectangularColorSpace.includes(arg.value) ||
          polarColorSpace.includes(arg.value) ||
          hueInterpolationMethod.includes(arg.value)
        ) {
          interpolation.value += ` ${arg.value}`
        } else {
          // this should be color like red, blue....
          stops[stops.length] = {
            color: arg,
          }
        }
      } else if (arg.type === 'angle') {
        if (stops.length === 0) {
          angle = arg
        } else {
          if (!stops[stops.length - 1].position) {
            stops[stops.length - 1].position = {}
          }
          if (stops[stops.length - 1].position?.start) {
            stops[stops.length - 1].position.end = arg
          } else {
            stops[stops.length - 1].position.start = arg
          }
        }
      } else if (arg.type === 'length') {
        if (stops.length === 0) {
          if (!position.x && !position.y) {
            position = {
              x: {},
              y: {},
            }
          }
          if (position.x?.offset) {
            position.y.offset = arg
          } else {
            position.x.offset = arg
          }
        } else {
          if (stops[stops.length - 1].position?.start) {
            stops[stops.length - 1].position.end = arg
          } else {
            stops[stops.length - 1].position.start = arg
          }
        }
      } else if (arg.type === 'hex') {
        stops[stops.length] = {
          color: arg,
        }
      } else if (arg.type === 'function') {
        // this should be the color using functions
        stops[stops.length] = {
          color: arg,
        }
      }
    })

    return {
      type: 'function',
      name: values[0].name,
      angle,
      position,
      stops,
      interpolation,
    }
  }

  const parseBackground = (
    image: any,
    valueToCheck: any,
    positionSet: any,
    valueToReturn?: any,
  ) => {
    let color
    const returnValue = valueToReturn ? valueToReturn : valueToCheck

    // Background image
    if (
      (valueToCheck.type === 'function' &&
        imageBg.includes(valueToCheck.name)) ||
      valueToCheck.value === 'none'
    ) {
      if (valueToCheck.name === 'linear-gradient') {
        image.image = valueToCheck
      } else if (valueToCheck.name === 'conic-gradient') {
        image.image = valueToCheck
      } else {
        image.image = returnValue
      }
    } else if (positionBg.includes(valueToCheck.value) && !positionSet) {
      // Background position
      if (!image.position.x.align) {
        if (!image.position.x) {
          image.position.x = { align: null, offset: null }
        }
        image.position.x.align = returnValue
      } else {
        image.position.y.align = returnValue
      }
    } else if (valueToCheck.type === 'length' && !positionSet) {
      if (!image.position.x.offset && !image.position.y.align) {
        image.position.x.offset = returnValue
      } else {
        image.position.y.offset = returnValue
      }
    } else if (
      (valueToCheck.type === 'length' || sizeBg.includes(valueToCheck.value)) &&
      positionSet
    ) {
      // Background size
      if (['cover', 'contain'].includes(returnValue.value)) {
        image.size = returnValue
      } else {
        if (!image.size) {
          image.size = { width: null, height: null }
        }
        if (!image.size.width) {
          image.size.width = returnValue
        } else {
          image.size.height = returnValue
        }
      }
    } else if (repeatStyle.includes(valueToCheck.value)) {
      // Background repeat
      if (valueToCheck.value === 'repeat-x') {
        image.repeat.horizontal = { type: 'keyword', value: 'repeat' }
        image.repeat.vertical = { type: 'keyword', value: 'no-repeat' }
      } else if (valueToCheck.value === 'repeat-y') {
        image.repeat.horizontal = { type: 'keyword', value: 'no-repeat' }
        image.repeat.vertical = { type: 'keyword', value: 'repeat' }
      } else {
        if (!image.repeat.horizontal) {
          image.repeat.horizontal = returnValue
        }
        image.repeat.vertical = returnValue
      }
    } else if (attachmentBg.includes(valueToCheck.value)) {
      // Background attachment
      image.attachment = returnValue
    } else if (visualBoxBg.includes(valueToCheck.value)) {
      // Background origin and background clip
      if (!image.origin) {
        image.origin = returnValue
        image.clip = returnValue
      } else {
        image.clip = returnValue
      }
    } else if (isColor(valueToCheck.value)) {
      // Background color
      color = returnValue
    } else if (
      valueToCheck.type === 'function' &&
      colorFunction.includes(valueToCheck.name) &&
      isColor(`${valueToCheck.name}(${valueToCheck.value})`)
    ) {
      color = returnValue
    } else if (
      valueToCheck.type === 'function' &&
      valueToCheck.name === 'var'
    ) {
      // If it's a varibale
      const allValues = valueToCheck.value.split(', ')
      allValues.forEach((val: any) => {
        if (val.startsWith('--')) {
          const usedVariable: any = variables.find(
            (v: any) => v.name === val.slice(2),
          )
          if (!usedVariable) {
            return
          }

          const parsedVariable = parseMultipleValues([
            {
              value:
                usedVariable.unit && usedVariable.unit !== ''
                  ? `${usedVariable.value}${usedVariable.unit}`
                  : usedVariable.value,
            },
          ])
          const newProp = parseBackground(
            image,
            parsedVariable[0],
            positionSet,
            valueToCheck,
          )

          if (newProp.color) {
            color = newProp.color
            return
          } else {
            image = { ...image, ...newProp.image }
          }
        } else {
          const parsedVariable = parseMultipleValues([{ value: val }])
          const newProp = parseBackground(
            image,
            parsedVariable[0],
            positionSet,
            valueToCheck,
          )

          if (newProp.color) {
            color = newProp.color
          } else {
            image = { ...image, ...newProp.image }
          }
        }
      })
    } else if (valueToCheck.type === 'slash') {
      // Flag that the position is set
      positionSet = true
    }

    return { image, color, positionSet }
  }

  const parseBorderOrOutline = (
    valueToCheck: any,
    property: string = 'border',
    valueToReturn?: any,
  ) => {
    let width
    let style
    let color
    let invalidValue

    const returnValue = valueToReturn ? valueToReturn : valueToCheck

    if (
      isColor(valueToCheck.value) ||
      (valueToCheck.type === 'function' &&
        colorFunction.includes(valueToCheck.name) &&
        isColor(`${valueToCheck.name}(${valueToCheck.value})`))
    ) {
      color = returnValue
    } else if (
      valueToCheck.type === 'length' ||
      ['thin', 'medium', 'thick'].includes(valueToCheck.value)
    ) {
      width = returnValue
    } else if (
      (property === 'border' && lineStyle.includes(valueToCheck.value)) ||
      (property === 'outline' && outlineStyle.includes(valueToCheck.value))
    ) {
      style = returnValue
    } else if (
      valueToCheck.type === 'function' &&
      valueToCheck.name === 'var'
    ) {
      // If it's a varibale
      const allValues = valueToCheck.value.split(', ')
      allValues.forEach((val: any) => {
        if (val.startsWith('--')) {
          const usedVariable: any = variables.find(
            (v: any) => v.name === val.slice(2),
          )
          if (!usedVariable) {
            return
          }

          const value: any =
            usedVariable.unit && usedVariable.unit !== ''
              ? getValue(
                  (
                    parse(`${usedVariable.value}${usedVariable.unit}`) as any
                  )[0],
                )
              : getValue((parse(usedVariable.value) as any)[0])

          const parsedVariable = parseMultipleValues(value)
          const newProp = parseBorderOrOutline(
            parsedVariable[0],
            property,
            valueToCheck,
          )

          if (newProp.color) {
            color = returnValue
          } else if (newProp.width) {
            width = returnValue
          } else if (newProp.style) {
            style = returnValue
          }
        } else {
          const parsedVariable = parseMultipleValues([{ value: val }])
          const newProp = parseBorderOrOutline(
            parsedVariable[0],
            property,
            valueToCheck,
          )

          if (newProp.color) {
            color = returnValue
          } else if (newProp.width) {
            width = returnValue
          } else if (newProp.style) {
            style = returnValue
          }
        }
      })
    } else {
      invalidValue = true
    }
    return { width, style, color, invalidValue }
  }

  const parseBoxShadow = (
    boxShadow: any,
    valueToCheck: any,
    valueToReturn?: any,
  ) => {
    let horizontal
    let vertical
    let blur
    let spread
    let color
    let position
    let invalidValue

    const returnValue = valueToReturn ? valueToReturn : valueToCheck

    if (
      isColor(valueToCheck.value) ||
      (valueToCheck.type === 'function' &&
        colorFunction.includes(valueToCheck.name) &&
        isColor(`${valueToCheck.name}(${valueToCheck.value})`))
    ) {
      color = returnValue
    } else if (
      valueToCheck.type === 'keyword' &&
      ['outset', 'inset'].includes(valueToCheck.value)
    ) {
      position = returnValue
    } else if (
      (valueToCheck.type === 'length' || valueToCheck.value === 'none') &&
      !boxShadow.horizontal
    ) {
      horizontal = returnValue
    } else if (
      (valueToCheck.type === 'length' || valueToCheck.value === 'none') &&
      !boxShadow.vertical
    ) {
      vertical = returnValue
    } else if (valueToCheck.type === 'length' && !boxShadow.blur) {
      blur = returnValue
    } else if (valueToCheck.type === 'length' && !boxShadow.spread) {
      spread = returnValue
    } else if (
      valueToCheck.type === 'function' &&
      valueToCheck.name === 'var'
    ) {
      // If it's a varibale
      const allValues = valueToCheck.value.split(', ')
      allValues.forEach((val: any) => {
        if (val.startsWith('--')) {
          const usedVariable: any = variables.find(
            (v: any) => v.name === val.slice(2),
          )
          if (!usedVariable) {
            return
          }

          const parsedVariable = parseMultipleValues([
            {
              value:
                usedVariable.unit && usedVariable.unit !== ''
                  ? `${usedVariable.value}${usedVariable.unit}`
                  : usedVariable.value,
            },
          ])
          const newProp = parseBoxShadow(
            boxShadow,
            parsedVariable[0],
            valueToCheck,
          )

          if (newProp.color) {
            color = returnValue
          } else if (newProp.position) {
            position = returnValue
          } else if (newProp.horizontal) {
            horizontal = returnValue
          } else if (newProp.vertical) {
            vertical = returnValue
          } else if (newProp.blur) {
            blur = returnValue
          } else if (newProp.spread) {
            spread = returnValue
          }
        } else {
          const parsedVariable = parseMultipleValues([{ value: val }])
          const newProp = parseBoxShadow(
            boxShadow,
            parsedVariable[0],
            valueToCheck,
          )

          if (newProp.color) {
            color = returnValue
          } else if (newProp.position) {
            position = returnValue
          } else if (newProp.horizontal) {
            horizontal = returnValue
          } else if (newProp.vertical) {
            vertical = returnValue
          } else if (newProp.blur) {
            blur = returnValue
          } else if (newProp.spread) {
            spread = returnValue
          }
        }
      })
    } else {
      invalidValue = true
    }
    return { horizontal, vertical, blur, spread, color, position, invalidValue }
  }

  const parseBorderRadius = (
    valueToCheck: any,
    horizontalSet: any,
    valueToReturn?: any,
  ) => {
    let horizontalValue
    let verticalValue

    const returnValue = valueToReturn ? valueToReturn : valueToCheck

    if (valueToCheck.type === 'length' && !horizontalSet) {
      horizontalValue = returnValue
    } else if (valueToCheck.type === 'length' && horizontalSet) {
      verticalValue = returnValue
    } else if (
      valueToCheck.type === 'function' &&
      valueToCheck.name === 'var'
    ) {
      // If it's a varibale
      const allValues = valueToCheck.value.split(', ')
      allValues.forEach((val: any) => {
        if (val.startsWith('--')) {
          const usedVariable: any = variables.find(
            (v: any) => v.name === val.slice(2),
          )
          if (!usedVariable) {
            return
          }

          const parsedVariable = parseMultipleValues([
            {
              value:
                usedVariable.unit && usedVariable.unit !== ''
                  ? `${usedVariable.value}${usedVariable.unit}`
                  : usedVariable.value,
            },
          ])
          const newProp = parseBorderRadius(
            parsedVariable[0],
            horizontalSet,
            valueToCheck,
          )

          if (newProp.horizontalValue) {
            horizontalValue = returnValue
          } else if (newProp.verticalValue) {
            verticalValue = returnValue
          }
        } else {
          const parsedVariable = parseMultipleValues([{ value: val }])
          const newProp = parseBorderRadius(
            parsedVariable[0],
            horizontalSet,
            valueToCheck,
          )

          if (newProp.horizontalValue) {
            horizontalValue = returnValue
          } else if (newProp.verticalValue) {
            verticalValue = returnValue
          }
        }
      })
    } else if (valueToCheck.type === 'slash') {
      // Flag that the horizontal values are set
      horizontalSet = true
    }
    return { horizontalValue, verticalValue, horizontalSet }
  }

  const parseFlex = (flex: any, valueToCheck: any, valueToReturn?: any) => {
    let grow
    let shrink
    let basis

    const returnValue = valueToReturn ? valueToReturn : valueToCheck

    if (valueToCheck.type === 'number') {
      if (!flex.grow) {
        grow = returnValue
      } else {
        shrink = returnValue
      }
    } else if (
      valueToCheck.type === 'function' &&
      valueToCheck.name === 'var'
    ) {
      // If it's a varibale
      const allValues = valueToCheck.value.split(', ')
      allValues.forEach((val: any) => {
        if (val.startsWith('--')) {
          const usedVariable: any = variables.find(
            (v: any) => v.name === val.slice(2),
          )
          if (!usedVariable) {
            return
          }

          const parsedVariable = parseMultipleValues([
            {
              value:
                usedVariable.unit &&
                usedVariable.unit !== '' &&
                usedVariable.unit !== ''
                  ? `${usedVariable.value}${usedVariable.unit}`
                  : usedVariable.value,
            },
          ])
          const newProp = parseFlex(flex, parsedVariable[0], valueToCheck)

          if (newProp.grow) {
            grow = returnValue
          } else if (newProp.shrink) {
            shrink = returnValue
          } else if (newProp.basis) {
            basis = returnValue
          }
        } else {
          const parsedVariable = parseMultipleValues([{ value: val }])
          const newProp = parseFlex(flex, parsedVariable[0], valueToCheck)

          if (newProp.grow) {
            grow = returnValue
          } else if (newProp.shrink) {
            shrink = returnValue
          } else if (newProp.basis) {
            basis = returnValue
          }
        }
      })
    } else {
      basis = returnValue
    }
    return { grow, shrink, basis }
  }

  const parseFont = (valueToCheck: any, sizeSet: any, valueToReturn?: any) => {
    let style
    let styleAngle
    let variant
    let weight
    let stretch
    let size
    let lineHeight
    let family

    const returnValue = valueToReturn ? valueToReturn : valueToCheck

    if (['italic', 'oblique'].includes(valueToCheck.value)) {
      style = returnValue
    } else if (valueToCheck.type === 'angle') {
      styleAngle = returnValue
    } else if (
      ['small-caps'].includes(valueToCheck.value) ||
      valueToCheck.type === 'angle'
    ) {
      variant = returnValue
    } else if (
      ['bolder', 'lighter', 'bold'].includes(valueToCheck.value) ||
      (valueToCheck.type === 'number' &&
        (valueToCheck.value >= 1 || valueToCheck.value <= 1000) &&
        !sizeSet)
    ) {
      weight = returnValue
    } else if (fontStretchValues.includes(valueToCheck.value)) {
      stretch = returnValue
    } else if (
      absoluteSize.includes(valueToCheck.value) ||
      relativeSize.includes(valueToCheck.value) ||
      (valueToCheck.type === 'length' && !sizeSet) ||
      (valueToCheck.type === 'function' && valueToCheck.name === 'math')
    ) {
      size = returnValue
    } else if (
      (valueToCheck.value === 'normal' ||
        valueToCheck.type === 'number' ||
        valueToCheck.type === 'length') &&
      sizeSet
    ) {
      lineHeight = returnValue
    } else if (
      valueToCheck.type === 'string' ||
      genericFonts.includes(valueToCheck.value) ||
      valueToCheck.type === 'keyword'
    ) {
      family = returnValue
    } else if (
      valueToCheck.type === 'function' &&
      valueToCheck.name === 'var'
    ) {
      // If it's a varibale
      const allValues = valueToCheck.value.split(', ')
      allValues.forEach((val: any) => {
        if (val.startsWith('--')) {
          const usedVariable: any = variables.find(
            (v: any) => v.name === val.slice(2),
          )
          if (!usedVariable) {
            return
          }

          const parsedVariable = parseMultipleValues([
            {
              value:
                usedVariable.unit && usedVariable.unit !== ''
                  ? `${usedVariable.value}${usedVariable.unit}`
                  : usedVariable.value,
            },
          ])
          const newProp = parseFont(parsedVariable[0], sizeSet, valueToCheck)

          if (newProp.style) {
            style = returnValue
          } else if (newProp.styleAngle) {
            styleAngle = returnValue
          } else if (newProp.variant) {
            variant = returnValue
          } else if (newProp.weight) {
            weight = returnValue
          } else if (newProp.stretch) {
            stretch = returnValue
          } else if (newProp.size) {
            size = returnValue
          } else if (newProp.lineHeight) {
            lineHeight = returnValue
          } else if (newProp.family) {
            family = returnValue
          }
        } else {
          const parsedVariable = parseMultipleValues([{ value: val }])
          const newProp = parseFont(parsedVariable[0], sizeSet, valueToCheck)

          if (newProp.style) {
            style = returnValue
          } else if (newProp.styleAngle) {
            styleAngle = returnValue
          } else if (newProp.variant) {
            variant = returnValue
          } else if (newProp.weight) {
            weight = returnValue
          } else if (newProp.stretch) {
            stretch = returnValue
          } else if (newProp.size) {
            size = returnValue
          } else if (newProp.lineHeight) {
            lineHeight = returnValue
          } else if (newProp.family) {
            family = returnValue
          }
        }
      })
    } else if (valueToCheck.type === 'slash') {
      // Flag that the position is set
      sizeSet = true
    }
    return {
      style,
      styleAngle,
      variant,
      weight,
      stretch,
      size,
      lineHeight,
      family,
      sizeSet,
    }
  }

  const parseDecoration = (valueToCheck: any, valueToReturn?: any) => {
    let line
    let style
    let color
    let thickness

    const returnValue = valueToReturn ? valueToReturn : valueToCheck

    if (textDecorationLine.includes(valueToCheck.value)) {
      line = returnValue
    } else if (textDecorationStyleValues.includes(valueToCheck.value)) {
      style = returnValue
    } else if (
      isColor(valueToCheck.value) ||
      (valueToCheck.type === 'function' &&
        colorFunction.includes(valueToCheck.name) &&
        isColor(`${valueToCheck.name}(${valueToCheck.value})`))
    ) {
      color = returnValue
    } else if (
      ['auto', 'from-font'].includes(valueToCheck.value) ||
      valueToCheck.type === 'length'
    ) {
      thickness = returnValue
    } else if (
      valueToCheck.type === 'function' &&
      valueToCheck.name === 'var'
    ) {
      // If it's a varibale
      const allValues = valueToCheck.value.split(', ')
      allValues.forEach((val: any) => {
        if (val.startsWith('--')) {
          const usedVariable: any = variables.find(
            (v: any) => v.name === val.slice(2),
          )
          if (!usedVariable) {
            return
          }

          const parsedVariable = parseMultipleValues([
            {
              value:
                usedVariable.unit && usedVariable.unit !== ''
                  ? `${usedVariable.value}${usedVariable.unit}`
                  : usedVariable.value,
            },
          ])
          const newProp = parseDecoration(parsedVariable[0], valueToCheck)

          if (newProp.line) {
            line = returnValue
          } else if (newProp.style) {
            style = returnValue
          } else if (newProp.color) {
            color = returnValue
          } else if (newProp.thickness) {
            thickness = returnValue
          }
        } else {
          const parsedVariable = parseMultipleValues([{ value: val }])
          const newProp = parseDecoration(parsedVariable[0], valueToCheck)

          if (newProp.line) {
            line = returnValue
          } else if (newProp.style) {
            style = returnValue
          } else if (newProp.color) {
            color = returnValue
          } else if (newProp.thickness) {
            thickness = returnValue
          }
        }
      })
    } else {
      // TODO: figure out what basis was supposed to be used for here
      // basis = returnValue
    }
    return { line, style, color, thickness }
  }

  const parseTextShadow = (
    textShadow: any,
    valueToCheck: any,
    valueToReturn?: any,
  ) => {
    let horizontal
    let vertical
    let blur
    let color
    let invalidValue

    const returnValue = valueToReturn ? valueToReturn : valueToCheck

    if (
      isColor(valueToCheck.value) ||
      (valueToCheck.type === 'function' &&
        colorFunction.includes(valueToCheck.name) &&
        isColor(`${valueToCheck.name}(${valueToCheck.value})`))
    ) {
      color = returnValue
    } else if (valueToCheck.type === 'length' && !textShadow.horizontal) {
      horizontal = returnValue
    } else if (valueToCheck.type === 'length' && !textShadow.vertical) {
      vertical = returnValue
    } else if (valueToCheck.type === 'length' && !textShadow.blur) {
      blur = returnValue
    } else if (
      valueToCheck.type === 'function' &&
      valueToCheck.name === 'var'
    ) {
      // If it's a varibale
      const allValues = valueToCheck.value.split(', ')
      allValues.forEach((val: any) => {
        if (val.startsWith('--')) {
          const usedVariable: any = variables.find(
            (v: any) => v.name === val.slice(2),
          )
          if (!usedVariable) {
            return
          }

          const parsedVariable = parseMultipleValues([
            {
              value:
                usedVariable.unit && usedVariable.unit !== ''
                  ? `${usedVariable.value}${usedVariable.unit}`
                  : usedVariable.value,
            },
          ])
          const newProp = parseTextShadow(
            textShadow,
            parsedVariable[0],
            valueToCheck,
          )

          if (newProp.color) {
            color = returnValue
          } else if (newProp.horizontal) {
            horizontal = returnValue
          } else if (newProp.vertical) {
            vertical = returnValue
          } else if (newProp.blur) {
            blur = returnValue
          }
        } else {
          const parsedVariable = parseMultipleValues([{ value: val }])
          const newProp = parseTextShadow(
            textShadow,
            parsedVariable[0],
            valueToCheck,
          )

          if (newProp.color) {
            color = returnValue
          } else if (newProp.horizontal) {
            horizontal = returnValue
          } else if (newProp.vertical) {
            vertical = returnValue
          } else if (newProp.blur) {
            blur = returnValue
          }
        }
      })
    } else {
      invalidValue = true
    }
    return { horizontal, vertical, blur, color, invalidValue }
  }

  const parseTransition = (
    transition: any,
    valueToCheck: any,
    valueToReturn?: any,
  ) => {
    let duration
    let delay
    let property
    let timing
    let behavior
    let invalidValue

    const returnValue = valueToReturn ? valueToReturn : valueToCheck

    if (valueToCheck.type === 'time' && !transition.duration) {
      duration = returnValue
    } else if (valueToCheck.type === 'time' && !transition.delay) {
      delay = returnValue
    } else if (['normal', 'allow-discrete'].includes(valueToCheck.value)) {
      behavior = returnValue
    } else if (
      timingFunctions.includes(valueToCheck.value) ||
      (valueToCheck.type === 'function' &&
        (valueToCheck.name === 'cubic-bezier' || valueToCheck.name === 'steps'))
    ) {
      timing = returnValue
    } else if (
      valueToCheck.type === 'function' &&
      valueToCheck.name === 'var'
    ) {
      // If it's a varibale
      const allValues = valueToCheck.value.split(', ')
      allValues.forEach((val: any) => {
        if (val.startsWith('--')) {
          const usedVariable: any = variables.find(
            (v: any) => v.name === val.slice(2),
          )
          if (!usedVariable) {
            return
          }

          const parsedVariable = parseMultipleValues([
            {
              value:
                usedVariable.unit && usedVariable.unit !== ''
                  ? `${usedVariable.value}${usedVariable.unit}`
                  : usedVariable.value,
            },
          ])
          const newProp = parseTransition(
            transition,
            parsedVariable[0],
            valueToCheck,
          )

          if (newProp.duration) {
            duration = returnValue
          } else if (newProp.delay) {
            delay = returnValue
          } else if (newProp.property) {
            property = returnValue
          } else if (newProp.timing) {
            timing = returnValue
          } else if (newProp.behavior) {
            behavior = returnValue
          }
        } else {
          const parsedVariable = parseMultipleValues([{ value: val }])
          const newProp = parseTransition(
            transition,
            parsedVariable[0],
            valueToCheck,
          )

          if (newProp.duration) {
            duration = returnValue
          } else if (newProp.delay) {
            delay = returnValue
          } else if (newProp.property) {
            property = returnValue
          } else if (newProp.timing) {
            timing = returnValue
          } else if (newProp.behavior) {
            behavior = returnValue
          }
        }
      })
    } else if (valueToCheck.type === 'keyword' && !transition.property) {
      property = returnValue
    } else {
      invalidValue = true
    }
    return { duration, delay, property, timing, behavior, invalidValue }
  }

  const isColor = (strColor: any) => {
    const s = new Option().style
    s.color = strColor
    return s.color !== ''
  }

  const checkIfNoUnknownVariables = (allValues: any) => {
    const variableNames = allValues
      .map((v: any) => {
        if (v.type === 'function' && v.name === 'var') {
          return v.value.slice(2)
        }
      })
      .filter((v: any) => v)
    const knownVariableNames = variables.map((variable: any) => variable.name)
    return variableNames.every((v: any) => knownVariableNames.includes(v))
  }

  if (args.style.constructor !== Object) {
    return console.error('The value you provided is not valid!')
  }

  let cssText = ''
  Object.entries(args.style).map(([key, value]) => {
    cssText += `${key}: ${value}; `
  })

  const element = document.createElement('div')
  element.style = cssText

  const style = element.style

  const styleKeys = Object.keys(args.style)

  let parsedStyle: any = {}

  // Backround
  if (
    args.style.background ||
    args.style['background-repeat'] ||
    args.style['background-size'] ||
    args.style['background-position'] ||
    args.style['background-position-x'] ||
    args.style['background-position-y'] ||
    args.style['background-origin'] ||
    args.style['background-clip'] ||
    args.style['background-attachment'] ||
    args.style['background-image'] ||
    args.style['background-color']
  ) {
    parsedStyle.background = { images: [], color: null }
    if (args.style.background) {
      const backgrounds: any = parse(args.style.background, false)

      // Go through all the backgrounds
      backgrounds.forEach((bg: any) => {
        let image = {
          image: null,
          repeat: {
            horizontal: null,
            vertical: null,
          },
          position: {
            x: {
              align: null,
              offset: null,
            },
            y: {
              align: null,
              offset: null,
            },
          },
          size: null,
          origin: null,
          clip: null,
          attachment: null,
        }
        let positionSet = false

        // Go through all the values in one background
        bg.nodes.forEach((property: any) => {
          const propValue = ['linear-gradient', 'conic-gradient'].includes(
            property.value,
          )
            ? getValue(property, true)
            : getValue(property)
          const valueToCheck =
            propValue.name === 'linear-gradient'
              ? parseLinearGradient([propValue])
              : propValue.name === 'conic-gradient'
                ? parseConicGradient([propValue])
                : parseMultipleValues([propValue])[0]

          const newProp = parseBackground(image, valueToCheck, positionSet)
          if (newProp.color) {
            parsedStyle.background.color = newProp.color
          } else {
            image = { ...image, ...newProp.image }
          }
          positionSet = newProp.positionSet
        })

        if (image.image) {
          parsedStyle.background.images.push(image)
        }
      })
    }

    const backgroundRepeat = parse(args.style['background-repeat']) ?? []
    const backgroundSize = parse(args.style['background-size']) ?? []
    const backgroundPosition = parse(args.style['background-position']) ?? []
    const backgroundPositionX = parse(args.style['background-position-x']) ?? []
    const backgroundPositionY = parse(args.style['background-position-y']) ?? []
    const backgroundOrigin = parse(args.style['background-origin']) ?? []
    const backgroundClip = parse(args.style['background-clip']) ?? []
    const backgroundAttachment =
      parse(args.style['background-attachment']) ?? []
    const backgroundImages = parse(args.style['background-image']) ?? []

    const backgroundLength = Math.max(
      backgroundRepeat.length,
      backgroundSize.length,
      backgroundPosition.length,
      backgroundPositionX.length,
      backgroundPositionY.length,
      backgroundOrigin.length,
      backgroundClip.length,
      backgroundAttachment.length,
      backgroundImages.length,
    )

    ;[...Array(backgroundLength).keys()].map((index) => {
      if (!parsedStyle.background.images?.[index]) {
        parsedStyle.background.images[index] = {
          image: null,
          repeat: null,
          size: null,
          position: null,
          origin: null,
          clip: null,
          attachment: null,
        }
      }

      if (
        args.style['background-image'] &&
        styleKeys.indexOf('background-image') > styleKeys.indexOf('background')
      ) {
        const functionName = backgroundImages[index].nodes[0].value

        if (functionName === 'linear-gradient') {
          const backgroundImageVal = getValue(backgroundImages[index], true)

          parsedStyle.background.images[index].image =
            parseLinearGradient(backgroundImageVal)
        } else if (functionName === 'conic-gradient') {
          const backgroundImageVal = getValue(backgroundImages[index], true)

          parsedStyle.background.images[index].image =
            parseConicGradient(backgroundImageVal)
        } else {
          const backgroundImageVal = getValue(backgroundImages[index])
          if (backgroundImageVal) {
            parsedStyle.background.images[index].image =
              parseMultipleValues(backgroundImageVal)[0]
          }
        }
      }

      if (
        args.style['background-repeat'] &&
        styleKeys.indexOf('background-repeat') > styleKeys.indexOf('background')
      ) {
        if (getValue(backgroundRepeat[index])) {
          parsedStyle.background.images[index].repeat = parseRepeat(
            getValue(backgroundRepeat[index]),
          )
        }
      }

      if (
        args.style['background-size'] &&
        styleKeys.indexOf('background-size') > styleKeys.indexOf('background')
      ) {
        const backgroundSizeValue = getValue(backgroundSize[index])
        if (backgroundSizeValue) {
          parsedStyle.background.images[index].size = [
            'cover',
            'contain',
          ].includes(backgroundSizeValue[0].value)
            ? parseMultipleValues(backgroundSizeValue)[0]
            : {
                width: parseMultipleValues(backgroundSizeValue)[0],
                height: parseMultipleValues(backgroundSizeValue)?.[1] ?? null,
              }
        }
      }

      if (
        args.style['background-position'] &&
        styleKeys.indexOf('background-position') >
          styleKeys.indexOf('background')
      ) {
        const backgroundPosVal = getValue(backgroundPosition[index])
        if (backgroundPosVal) {
          const parsedVal = parseMultipleValues(backgroundPosVal)
          if (parsedVal.length === 1) {
            parsedStyle.background.images[index].position = {
              x: {
                align: parsedVal[0].type === 'keyword' ? parsedVal[0] : null,
                offset: parsedVal[0].type === 'length' ? parsedVal[0] : null,
              },
              y: {
                align: null,
                offset: null,
              },
            }
          } else if (parsedVal.length === 2) {
            parsedStyle.background.images[index].position = {
              x: {
                align: parsedVal[0].type === 'keyword' ? parsedVal[0] : null,
                offset: parsedVal[0].type === 'length' ? parsedVal[0] : null,
              },
              y: {
                align: parsedVal[1].type === 'keyword' ? parsedVal[1] : null,
                offset: parsedVal[1].type === 'length' ? parsedVal[1] : null,
              },
            }
          } else if (parsedVal.length === 3) {
            parsedStyle.background.images[index].position = {
              x: {
                align: parsedVal[0],
                offset: parsedVal[1].type === 'length' ? parsedVal[1] : null,
              },
              y: {
                align:
                  parsedVal[1].type === 'keyword' ? parsedVal[1] : parsedVal[2],
                offset: parsedVal[2].type === 'length' ? parsedVal[2] : null,
              },
            }
          }
        }
      }

      if (
        args.style['background-position-x'] &&
        styleKeys.indexOf('background-position-x') >
          styleKeys.indexOf('background')
      ) {
        const backgroundPosXVal = getValue(backgroundPositionX[index])
        const backgroundPosYVal = getValue(backgroundPositionY[index])
        if (backgroundPosXVal || backgroundPosYVal) {
          parsedStyle.background.images[index].position = {
            x: backgroundPosXVal
              ? {
                  align: parseMultipleValues(backgroundPosXVal)[0],
                  offset: parseMultipleValues(backgroundPosXVal)?.[1] ?? null,
                }
              : null,
            y: backgroundPosYVal
              ? {
                  align: parseMultipleValues(backgroundPosYVal)[0],
                  offset: parseMultipleValues(backgroundPosYVal)?.[1] ?? null,
                }
              : null,
          }
        }
      }

      if (
        args.style['background-position-y'] &&
        styleKeys.indexOf('background-position-y') >
          styleKeys.indexOf('background')
      ) {
        const backgroundOriginVal = getValue(backgroundOrigin[index])
        if (backgroundOriginVal) {
          parsedStyle.background.images[index].origin =
            parseMultipleValues(backgroundOriginVal)[0]
        }
      }

      if (
        args.style['background-clip'] &&
        styleKeys.indexOf('background-clip') > styleKeys.indexOf('background')
      ) {
        const backgroundClipVal = getValue(backgroundClip[index])
        if (backgroundClipVal) {
          parsedStyle.background.images[index].clip =
            parseMultipleValues(backgroundClipVal)[0]
        }
      }

      if (
        args.style['background-attachment'] &&
        styleKeys.indexOf('background-attachment') >
          styleKeys.indexOf('background')
      ) {
        const backgroundAttachpVal = getValue(backgroundAttachment[index])
        if (backgroundAttachpVal) {
          parsedStyle.background.images[index].attachment =
            backgroundAttachpVal[0].value ===
            parseMultipleValues(backgroundAttachpVal)[0]
        }
      }
    })

    if (
      args.style['background-color'] &&
      styleKeys.indexOf('background-color') > styleKeys.indexOf('background')
    ) {
      const backgroundColor: any = parse(args.style['background-color'])

      parsedStyle.background.color = parseMultipleValues(
        getValue(backgroundColor[0]),
      )[0]
    }

    parsedStyle.background.images = parsedStyle.background.images.reverse()
  } else {
    parsedStyle.background = null
  }

  // Transition
  if (
    args.style['transition-duration'] ||
    args.style['transition-delay'] ||
    args.style['transition-property'] ||
    args.style['transition-timing-function'] ||
    args.style['transition-behavior'] ||
    args.style.transition
  ) {
    const invalidValues: any[] = []
    const shorthandTransition: any[] = []

    if (args.style.transition) {
      const transitions = parse(args.style.transition)

      parsedStyle.transition = transitions?.map((t, index) => {
        const invVals: any[] = []
        const transition = {
          duration: null,
          delay: null,
          property: null,
          timing: null,
          behavior: null,
        }

        const values = getValue(t)
        const allValues = parseMultipleValues(values)
        const allVariablesKnown = checkIfNoUnknownVariables(allValues)

        if (allVariablesKnown) {
          // Go through all the values in the transition property
          allValues.forEach((pv: any) => {
            const newProp = parseTransition(transition, pv)
            if (newProp.invalidValue) {
              invVals.push(pv)
            } else if (newProp.duration) {
              transition.duration = newProp.duration
            } else if (newProp.delay) {
              transition.delay = newProp.delay
            } else if (newProp.property) {
              transition.property = newProp.property
            } else if (newProp.timing) {
              transition.timing = newProp.timing
            } else if (newProp.behavior) {
              transition.behavior = newProp.behavior
            }
          })

          shorthandTransition.push(transition)

          // We apply only if no invalid values
          if (invVals.length === 0) {
            return transition
          } else {
            invalidValues.push(invVals)
            return {
              duration: null,
              delay: null,
              property: null,
              timing: null,
              behavior: null,
            }
          }
        } else {
          // Parse the values by the order
          return {
            property: allValues[0],
            duration: allValues[1],
            timing: allValues[2],
            delay: allValues[3],
            behavior: allValues[4],
          }
        }
      })
    }

    const transitionDuration = parse(args.style['transition-duration']) ?? []
    const transitionDelay = parse(args.style['transition-delay']) ?? []
    const transitionProperty = parse(args.style['transition-property']) ?? []
    const transitionTimingFunction =
      parse(args.style['transition-timing-function']) ?? []
    const transitionBehavior = parse(args.style['transition-behavior']) ?? []

    const transLength = Math.max(
      transitionBehavior.length,
      transitionDelay.length,
      transitionDuration.length,
      transitionProperty.length,
      transitionTimingFunction.length,
    )

    ;[...Array(transLength).keys()].map((index) => {
      if (!parsedStyle.transition[index]) {
        parsedStyle.transition[index] = {
          duration: null,
          delay: null,
          property: null,
          timing: null,
          behavior: null,
        }
      }

      if (
        args.style['transition-property'] &&
        (styleKeys.indexOf('transition-property') >
          styleKeys.indexOf('transition') ||
          invalidValues[index].length > 0)
      ) {
        if (getValue(transitionProperty[index])) {
          const parsedProperty = parseMultipleValues(
            getValue(transitionProperty[index]),
          )[0]

          // If it's a variable we always return that
          if (
            (parsedProperty.type === 'function' &&
              parsedProperty.name === 'var') ||
            !args.style.transition
          ) {
            parsedStyle.transition[index].property = parsedProperty
          } else {
            // Check if it's a valid value
            const newProp = parseTransition(
              parsedStyle.transition[index],
              parsedProperty,
            )

            if (newProp.property) {
              parsedStyle.transition[index].property = newProp.property
            }
          }
        }
      }

      if (
        args.style['transition-duration'] &&
        (styleKeys.indexOf('transition-duration') >
          styleKeys.indexOf('transition') ||
          invalidValues[index].length > 0)
      ) {
        if (getValue(transitionDuration[index])) {
          const parsedDuration = parseMultipleValues(
            getValue(transitionDuration[index]),
          )[0]

          // If it's a variable we always return that
          if (
            (parsedDuration.type === 'function' &&
              parsedDuration.name === 'var') ||
            !args.style.transition
          ) {
            parsedStyle.transition[index].duration = parsedDuration
          } else {
            // Check if it's a valid value
            const newProp = parseTransition(
              parsedStyle.transition[index],
              parsedDuration,
            )

            if (newProp.duration) {
              parsedStyle.transition[index].duration = newProp.duration
            }
          }
        }
      }

      if (
        args.style['transition-delay'] &&
        (styleKeys.indexOf('transition-delay') >
          styleKeys.indexOf('transition') ||
          invalidValues[index].length > 0)
      ) {
        if (getValue(transitionDelay[index])) {
          const parsedDelay = parseMultipleValues(
            getValue(transitionDelay[index]),
          )[0]

          // If it's a variable we always return that
          if (
            (parsedDelay.type === 'function' && parsedDelay.name === 'var') ||
            !args.style.transition
          ) {
            parsedStyle.transition[index].delay = parsedDelay
          } else {
            // Check if it's a valid value
            const newProp = parseTransition(
              parsedStyle.transition[index],
              parsedDelay,
            )

            if (newProp.delay) {
              parsedStyle.transition[index].delay = newProp.delay
            }
          }
        }
      }

      if (
        args.style['transition-timing-function'] &&
        (styleKeys.indexOf('transition-timing-function') >
          styleKeys.indexOf('transition') ||
          invalidValues[index].length > 0)
      ) {
        if (getValue(transitionTimingFunction[index])) {
          const parsedTiming = parseMultipleValues(
            getValue(transitionTimingFunction[index]),
          )[0]

          // If it's a variable we always return that
          if (
            (parsedTiming.type === 'function' && parsedTiming.name === 'var') ||
            !args.style.transition
          ) {
            parsedStyle.transition[index].timing = parsedTiming
          } else {
            // Check if it's a valid value
            const newProp = parseTransition(
              parsedStyle.transition[index],
              parsedTiming,
            )

            if (newProp.timing) {
              parsedStyle.transition[index].timing = newProp.timing
            }
          }
        }
      }

      if (
        args.style['transition-behavior'] &&
        (styleKeys.indexOf('transition-behavior') >
          styleKeys.indexOf('transition') ||
          invalidValues[index].length > 0)
      ) {
        if (getValue(transitionBehavior[index])) {
          const parsedBehavior = parseMultipleValues(
            getValue(transitionBehavior[index]),
          )[0]

          // If it's a variable we always return that
          if (
            (parsedBehavior.type === 'function' &&
              parsedBehavior.name === 'var') ||
            !args.style.transition
          ) {
            parsedStyle.transition[index].behavior = parsedBehavior
          } else {
            // Check if it's a valid value
            const newProp = parseTransition(
              parsedStyle.transition[index],
              parsedBehavior,
            )

            if (newProp.behavior) {
              parsedStyle.transition[index].behavior = newProp.behavior
            }
          }
        }
      }
    })

    invalidValues.forEach((iv, index) => {
      if (
        iv.length > 0 &&
        Object.values(parsedStyle.transition[index]).every((val) => !val)
      ) {
        parsedStyle.transition[index] = shorthandTransition[index]

        Object.entries(parsedStyle.transition[index]).forEach(
          ([key, value]) => {
            if (!value) {
              parsedStyle.transition[index][key] = iv[0]
              iv.shift()
            }
          },
        )
      }
    })
  } else {
    parsedStyle.transition = null
  }

  // Animation
  if (
    style.animationDuration !== '' ||
    style.animationTimingFunction !== '' ||
    style.animationDelay !== '' ||
    style.animationIterationCount !== '' ||
    style.animationDirection !== '' ||
    style.animationFillMode !== '' ||
    style.animationPlayState !== '' ||
    style.animationName !== ''
  ) {
    const animationDuration: any = parse(style.animationDuration)
    const animationTimingFunction: any = parse(style.animationTimingFunction)
    const animationDelay: any = parse(style.animationDelay)
    const animationIterationCount: any = parse(style.animationIterationCount)
    const animationDirection: any = parse(style.animationDirection)
    const animationFillMode: any = parse(style.animationFillMode)
    const animationPlayState: any = parse(style.animationPlayState)
    const animationName: any = parse(style.animationName)

    const animationLength = Math.max(
      animationDuration.length,
      animationTimingFunction.length,
      animationDelay.length,
      animationIterationCount.length,
      animationDirection.length,
      animationFillMode.length,
      animationPlayState.length,
      animationName.length,
    )

    parsedStyle.animation = [...Array(animationLength).keys()].map((index) => {
      const animation = {
        duration: null,
        timing: null,
        delay: null,
        iterationCount: null,
        direction: null,
        fillMode: null,
        playState: null,
        name: null,
      }

      if (getValue(animationDuration[index])) {
        animation.duration = parseMultipleValues(
          getValue(animationDuration[index]),
        )[0]
      }
      if (getValue(animationTimingFunction[index])) {
        animation.timing = parseMultipleValues(
          getValue(animationTimingFunction[index]),
        )[0]
      }
      if (getValue(animationDelay[index])) {
        animation.delay = parseMultipleValues(
          getValue(animationDelay[index]),
        )[0]
      }
      if (getValue(animationIterationCount[index])) {
        animation.iterationCount = parseMultipleValues(
          getValue(animationIterationCount[index]),
        )[0]
      }
      if (getValue(animationDirection[index])) {
        animation.direction = parseMultipleValues(
          getValue(animationDirection[index]),
        )[0]
      }
      if (getValue(animationFillMode[index])) {
        animation.fillMode = parseMultipleValues(
          getValue(animationFillMode[index]),
        )[0]
      }
      if (getValue(animationPlayState[index])) {
        animation.playState = parseMultipleValues(
          getValue(animationPlayState[index]),
        )[0]
      }
      if (getValue(animationName[index])) {
        animation.name = parseMultipleValues(getValue(animationName[index]))[0]
      }
      return animation
    })
  } else {
    parsedStyle.animation = null
  }

  // Box shadow
  if (args.style['box-shadow']) {
    const boxShadow: any = parse(args.style['box-shadow'])

    parsedStyle.boxShadow = boxShadow.map((shadow: any) => {
      const boxShadow: any = {
        horizontal: null,
        vertical: null,
        blur: null,
        spread: null,
        color: null,
        position: null,
      }
      const invalidValues: any[] = []

      const values = getValue(shadow)
      const allValues = parseMultipleValues(values)

      const allVariablesKnown = checkIfNoUnknownVariables(allValues)

      if (allVariablesKnown) {
        allValues.forEach((pv: any) => {
          const newProp = parseBoxShadow(boxShadow, pv)
          if (newProp.invalidValue) {
            invalidValues.push(pv)
          } else if (newProp.horizontal) {
            boxShadow.horizontal = newProp.horizontal
          } else if (newProp.vertical) {
            boxShadow.vertical = newProp.vertical
          } else if (newProp.blur) {
            boxShadow.blur = newProp.blur
          } else if (newProp.spread) {
            boxShadow.spread = newProp.spread
          } else if (newProp.color) {
            boxShadow.color = newProp.color
          } else if (newProp.position) {
            boxShadow.position = newProp.position
          }
        })

        // We apply only if no invalid values
        if (invalidValues.length === 0) {
          return boxShadow
        }
        // We also want to apply if the shorthand has invalid values and there are no any single properties defined
        if (invalidValues.length > 0) {
          Object.entries(boxShadow).forEach(([key, value]) => {
            if (!value) {
              boxShadow[key] = invalidValues[0]
              invalidValues.shift()
            }
          })
        }
        return boxShadow
      } else {
        // Parse the values by the order
        return {
          horizontal: allValues[0],
          vertical: allValues[1],
          blur: allValues[2],
          spread: allValues[3],
          color: allValues[4],
          position: allValues[5],
        }
      }
    })
  } else {
    parsedStyle.boxShadow = null
  }

  // Text shadow
  if (args.style['text-shadow']) {
    const textShadow: any = parse(args.style['text-shadow'])

    parsedStyle.textShadow = textShadow.map((shadow: any) => {
      const textShadow: any = {
        horizontal: null,
        vertical: null,
        blur: null,
        color: null,
      }
      const invalidValues: any[] = []

      const values = getValue(shadow)
      const allValues = parseMultipleValues(values)

      const allVariablesKnown = checkIfNoUnknownVariables(allValues)

      if (allVariablesKnown) {
        allValues.forEach((pv: any) => {
          const newProp = parseTextShadow(textShadow, pv)
          if (newProp.invalidValue) {
            invalidValues.push(pv)
          } else if (newProp.horizontal) {
            textShadow.horizontal = newProp.horizontal
          } else if (newProp.vertical) {
            textShadow.vertical = newProp.vertical
          } else if (newProp.blur) {
            textShadow.blur = newProp.blur
          } else if (newProp.color) {
            textShadow.color = newProp.color
          }
        })

        // We apply only if no invalid values
        if (invalidValues.length === 0) {
          return textShadow
        }
        // We also want to apply if the shorthand has invalid values and there are no any single properties defined
        if (invalidValues.length > 0) {
          Object.entries(textShadow).forEach(([key, value]) => {
            if (!value) {
              textShadow[key] = invalidValues[0]
              invalidValues.shift()
            }
          })
        }
        return textShadow
      } else {
        // Parse the values by the order
        return {
          horizontal: allValues[0],
          vertical: allValues[1],
          blur: allValues[2],
          color: allValues[3],
        }
      }
    })
  } else {
    parsedStyle.textShadow = null
  }

  // Margin
  if (
    style.marginTop !== '' ||
    style.marginRight !== '' ||
    style.marginBottom !== '' ||
    style.marginLeft !== ''
  ) {
    const marginTop: any = parse(style.marginTop)
    const marginRight: any = parse(style.marginRight)
    const marginBottom: any = parse(style.marginBottom)
    const marginLeft: any = parse(style.marginLeft)

    parsedStyle.margin = {
      left: parseMultipleValues(getValue(marginLeft[0]))?.[0] ?? null,
      right: parseMultipleValues(getValue(marginRight[0]))?.[0] ?? null,
      top: parseMultipleValues(getValue(marginTop[0]))?.[0] ?? null,
      bottom: parseMultipleValues(getValue(marginBottom[0]))?.[0] ?? null,
    }
  } else {
    if (style.margin !== '') {
      const margin: any = parse(style.margin)
      const marginValues = parseMultipleValues(getValue(margin[0]))

      parsedStyle.margin = {
        top: marginValues?.[0] ?? null,
        right: marginValues?.[1] ?? marginValues?.[0] ?? null,
        bottom: marginValues?.[2] ?? marginValues?.[0] ?? null,
        left:
          marginValues?.[3] ?? marginValues?.[1] ?? marginValues?.[0] ?? null,
      }
    } else {
      parsedStyle.margin = null
    }
  }

  // Padding
  if (
    style.paddingTop !== '' ||
    style.paddingRight !== '' ||
    style.paddingBottom !== '' ||
    style.paddingLeft !== ''
  ) {
    const paddingTop: any = parse(style.paddingTop)
    const paddingRight: any = parse(style.paddingRight)
    const paddingBottom: any = parse(style.paddingBottom)
    const paddingLeft: any = parse(style.paddingLeft)

    parsedStyle.padding = {
      left: parseMultipleValues(getValue(paddingLeft[0]))?.[0] ?? null,
      right: parseMultipleValues(getValue(paddingRight[0]))?.[0] ?? null,
      top: parseMultipleValues(getValue(paddingTop[0]))?.[0] ?? null,
      bottom: parseMultipleValues(getValue(paddingBottom[0]))?.[0] ?? null,
    }
  } else {
    if (style.padding !== '') {
      const padding: any = parse(style.padding)
      const paddingValues = parseMultipleValues(getValue(padding[0]))

      parsedStyle.padding = {
        top: paddingValues?.[0] ?? null,
        right: paddingValues?.[1] ?? paddingValues?.[0] ?? null,
        bottom: paddingValues?.[2] ?? paddingValues?.[0] ?? null,
        left:
          paddingValues?.[3] ??
          paddingValues?.[1] ??
          paddingValues?.[0] ??
          null,
      }
    } else {
      parsedStyle.padding = null
    }
  }

  // Transform
  if (
    style.transform !== '' ||
    style.transformOrigin !== '' ||
    style.transformStyle !== '' ||
    style.transformBox !== ''
  ) {
    const transform: any = parse(style.transform)
    const transformOrigin: any = parse(style.transformOrigin)
    const transformStyle: any = parse(style.transformStyle)
    const transformBox: any = parse(style.transformBox)

    parsedStyle.transform = { all: null, transformOrigin: null }

    parsedStyle.transform.all =
      parseTransformAll(parseMultipleValues(getValue(transform[0], true))) ?? []
    parsedStyle.transform.transformOrigin = {
      x: parseMultipleValues(getValue(transformOrigin[0]))?.[0] ?? null,
      y: parseMultipleValues(getValue(transformOrigin[0]))?.[1] ?? null,
      z: parseMultipleValues(getValue(transformOrigin[0]))?.[2] ?? null,
    }
    parsedStyle.transform.transformStyle =
      parseMultipleValues(getValue(transformStyle[0]))?.[0] ?? null
    parsedStyle.transform.transformBox =
      parseMultipleValues(getValue(transformBox[0]))?.[0] ?? null
  } else {
    parsedStyle.transform = { all: [], transformOrigin: {} }
  }

  // Inset
  if (
    style.top !== '' ||
    style.bottom !== '' ||
    style.left !== '' ||
    style.right !== ''
  ) {
    const top: any = parse(style.top)
    const bottom: any = parse(style.bottom)
    const left: any = parse(style.left)
    const right: any = parse(style.right)

    parsedStyle.inset = {
      top: parseMultipleValues(getValue(top[0]))?.[0] ?? null,
      bottom: parseMultipleValues(getValue(bottom[0]))?.[0] ?? null,
      left: parseMultipleValues(getValue(left[0]))?.[0] ?? null,
      right: parseMultipleValues(getValue(right[0]))?.[0] ?? null,
    }
  } else {
    if (style.inset !== '') {
      const inset: any = parse(style.inset)
      const insetValues = parseMultipleValues(getValue(inset[0]))

      parsedStyle.inset = {
        top: insetValues?.[0] ?? null,
        right: insetValues?.[1] ?? insetValues?.[0] ?? null,
        bottom: insetValues?.[2] ?? insetValues?.[0] ?? null,
        left: insetValues?.[3] ?? insetValues?.[1] ?? insetValues?.[0] ?? null,
      }
    } else {
      parsedStyle.inset = null
    }
  }

  // Border
  if (
    style.borderWidth !== '' ||
    style.borderStyle !== '' ||
    style.borderColor !== '' ||
    style.borderTopWidth !== '' ||
    style.borderTopStyle !== '' ||
    style.borderTopColor !== '' ||
    style.borderBottomWidth !== '' ||
    style.borderBottomStyle !== '' ||
    style.borderBottomColor !== '' ||
    style.borderLeftWidth !== '' ||
    style.borderLeftStyle !== '' ||
    style.borderLeftColor !== '' ||
    style.borderRightWidth !== '' ||
    style.borderRightStyle !== '' ||
    style.borderRightColor !== '' ||
    style.borderTop !== '' ||
    style.borderBottom !== '' ||
    style.borderLeft !== '' ||
    style.borderRight !== '' ||
    style.border !== ''
  ) {
    parsedStyle.border = {
      all: null,
      top: null,
      bottom: null,
      left: null,
      right: null,
    }

    const borderAll = style.border !== '' ? style.border : args.style.border

    if (borderAll && borderAll !== '') {
      const border: any = parse(borderAll, false)

      parsedStyle.border.all = {
        width: null,
        style: null,
        color: null,
      }

      // Go through all the values in the border
      border[0].nodes.forEach((property: any) => {
        const propValue = getValue(property)
        const valueToCheck = parseMultipleValues([propValue])[0]
        const newProp = parseBorderOrOutline(valueToCheck)
        if (newProp.width) {
          parsedStyle.border.all.width = newProp.width
        } else if (newProp.style) {
          parsedStyle.border.all.style = newProp.style
        } else if (newProp.color) {
          parsedStyle.border.all.color = newProp.color
        }
      })
    }

    // Border top
    if (style.borderTop !== '') {
      const border: any = parse(style.borderTop, false)

      parsedStyle.border.top = {
        width: null,
        style: null,
        color: null,
      }

      // Go through all the values in the border top property
      border[0].nodes.forEach((property: any) => {
        const propValue = getValue(property)
        const valueToCheck = parseMultipleValues([propValue])[0]
        const newProp = parseBorderOrOutline(valueToCheck)
        if (newProp.width) {
          parsedStyle.border.top.width = newProp.width
        } else if (newProp.style) {
          parsedStyle.border.top.style = newProp.style
        } else if (newProp.color) {
          parsedStyle.border.top.color = newProp.color
        }
      })
    } else if (
      style.borderTopWidth !== '' ||
      style.borderTopStyle !== '' ||
      style.borderTopColor !== ''
    ) {
      const borderTopWidth: any = parse(style.borderTopWidth)
      const borderTopStyle: any = parse(style.borderTopStyle)
      const borderTopColor: any = parse(style.borderTopColor)

      parsedStyle.border.top = {
        width: parseMultipleValues(getValue(borderTopWidth[0]))?.[0] ?? null,
        style: parseMultipleValues(getValue(borderTopStyle[0]))?.[0] ?? null,
        color: parseMultipleValues(getValue(borderTopColor[0]))?.[0] ?? null,
      }
    }

    // Border bottom
    if (style.borderBottom !== '') {
      const border: any = parse(style.borderBottom, false)

      parsedStyle.border.bottom = {
        width: null,
        style: null,
        color: null,
      }

      // Go through all the values in the border bottom property
      border[0].nodes.forEach((property: any) => {
        const propValue = getValue(property)
        const valueToCheck = parseMultipleValues([propValue])[0]
        const newProp = parseBorderOrOutline(valueToCheck)
        if (newProp.width) {
          parsedStyle.border.bottom.width = newProp.width
        } else if (newProp.style) {
          parsedStyle.border.bottom.style = newProp.style
        } else if (newProp.color) {
          parsedStyle.border.bottom.color = newProp.color
        }
      })
    } else if (
      style.borderBottomWidth !== '' ||
      style.borderBottomStyle !== '' ||
      style.borderBottomColor !== ''
    ) {
      const borderBottomWidth: any = parse(style.borderBottomWidth)
      const borderBottomStyle: any = parse(style.borderBottomStyle)
      const borderBottomColor: any = parse(style.borderBottomColor)

      parsedStyle.border.bottom = {
        width: parseMultipleValues(getValue(borderBottomWidth[0]))?.[0] ?? null,
        style: parseMultipleValues(getValue(borderBottomStyle[0]))?.[0] ?? null,
        color: parseMultipleValues(getValue(borderBottomColor[0]))?.[0] ?? null,
      }
    }

    // Border left
    if (style.borderLeft !== '') {
      const border: any = parse(style.borderLeft)

      parsedStyle.border.left = {
        width: null,
        style: null,
        color: null,
      }

      // Go through all the values in the border left property
      border[0].nodes.forEach((property: any) => {
        const propValue = getValue(property)
        const valueToCheck = parseMultipleValues([propValue])[0]
        const newProp = parseBorderOrOutline(valueToCheck)
        if (newProp.width) {
          parsedStyle.border.left.width = newProp.width
        } else if (newProp.style) {
          parsedStyle.border.left.style = newProp.style
        } else if (newProp.color) {
          parsedStyle.border.left.color = newProp.color
        }
      })
    } else if (
      style.borderLeftWidth !== '' ||
      style.borderLeftStyle !== '' ||
      style.borderLeftColor !== ''
    ) {
      const borderLeftWidth: any = parse(style.borderLeftWidth)
      const borderLeftStyle: any = parse(style.borderLeftStyle)
      const borderLeftColor: any = parse(style.borderLeftColor)

      parsedStyle.border.left = {
        width: parseMultipleValues(getValue(borderLeftWidth[0]))?.[0] ?? null,
        style: parseMultipleValues(getValue(borderLeftStyle[0]))?.[0] ?? null,
        color: parseMultipleValues(getValue(borderLeftColor[0]))?.[0] ?? null,
      }
    }

    // Border right
    if (style.borderRight !== '') {
      const border: any = parse(style.borderRight)

      parsedStyle.border.right = {
        width: null,
        style: null,
        color: null,
      }

      // Go through all the values in the border right property
      border[0].nodes.forEach((property: any) => {
        const propValue = getValue(property)
        const valueToCheck = parseMultipleValues([propValue])[0]
        const newProp = parseBorderOrOutline(valueToCheck)
        if (newProp.width) {
          parsedStyle.border.right.width = newProp.width
        } else if (newProp.style) {
          parsedStyle.border.right.style = newProp.style
        } else if (newProp.color) {
          parsedStyle.border.right.color = newProp.color
        }
      })
    } else if (
      style.borderRightWidth !== '' ||
      style.borderRightStyle !== '' ||
      style.borderRightColor !== ''
    ) {
      const borderRightWidth: any = parse(style.borderRightWidth)
      const borderRightStyle: any = parse(style.borderRightStyle)
      const borderRightColor: any = parse(style.borderRightColor)

      parsedStyle.border.right = {
        width: parseMultipleValues(getValue(borderRightWidth[0]))?.[0] ?? null,
        style: parseMultipleValues(getValue(borderRightStyle[0]))?.[0] ?? null,
        color: parseMultipleValues(getValue(borderRightColor[0]))?.[0] ?? null,
      }
    }
  } else {
    parsedStyle.border = null
  }

  // Border radius
  if (
    style.borderTopLeftRadius !== '' ||
    style.borderTopRightRadius !== '' ||
    style.borderBottomLeftRadius !== '' ||
    style.borderBottomRightRadius !== '' ||
    style.borderRadius !== ''
  ) {
    parsedStyle.borderRadius = {
      topLeft: null,
      topRight: null,
      bottomLeft: null,
      bottomRight: null,
    }

    if (style.borderRadius !== '') {
      const borderRadius: any = parse(style.borderRadius, false)

      let horizontalSet = false
      const horizontalValues: any[] = []
      const verticalValues: any[] = []

      // Go through all the values in the border right property
      borderRadius[0].nodes.forEach((property: any) => {
        const propValue = getValue(property)
        const valueToCheck = parseMultipleValues([propValue])[0]
        const newProp = parseBorderRadius(valueToCheck, horizontalSet)
        if (newProp.horizontalValue) {
          horizontalValues.push(newProp.horizontalValue)
        }
        if (newProp.verticalValue) {
          verticalValues.push(newProp.verticalValue)
        }
        if (newProp.horizontalSet) {
          horizontalSet = newProp.horizontalSet
        }
      })

      parsedStyle.borderRadius = {
        topLeft: {
          horizontal: horizontalValues[0] ?? null,
          vertical: verticalValues[0] ?? null,
        },
        topRight: {
          horizontal: horizontalValues[1] ?? null,
          vertical: verticalValues[0] ?? null,
        },
        bottomLeft: {
          horizontal:
            horizontalValues.length === 4
              ? horizontalValues[3]
              : horizontalValues.length === 1
                ? horizontalValues[0]
                : horizontalValues[1],
          vertical:
            verticalValues.length === 4
              ? verticalValues[3]
              : verticalValues.length === 1
                ? verticalValues[0]
                : verticalValues[1],
        },
        bottomRight: {
          horizontal:
            horizontalValues.length > 2
              ? horizontalValues[2]
              : horizontalValues[0],
          vertical:
            verticalValues.length > 2 ? verticalValues[2] : verticalValues[0],
        },
      }
    }

    if (style.borderTopLeftRadius !== '') {
      const borderTopLeftRadius: any = parse(style.borderTopLeftRadius)
      parsedStyle.borderRadius.topLeft = {
        horizontal:
          parseMultipleValues(getValue(borderTopLeftRadius[0]))?.[0] ?? null,
        vertical:
          parseMultipleValues(getValue(borderTopLeftRadius[0]))?.[1] ?? null,
      }
    }
    if (style.borderTopRightRadius !== '') {
      const borderTopRightRadius: any = parse(style.borderTopRightRadius)
      parsedStyle.borderRadius.topRight = {
        horizontal:
          parseMultipleValues(getValue(borderTopRightRadius[0]))?.[0] ?? null,
        vertical:
          parseMultipleValues(getValue(borderTopRightRadius[0]))?.[1] ?? null,
      }
    }
    if (style.borderBottomLeftRadius !== '') {
      const borderBottomLeftRadius: any = parse(style.borderBottomLeftRadius)
      parsedStyle.borderRadius.bottomLeft = {
        horizontal:
          parseMultipleValues(getValue(borderBottomLeftRadius[0]))?.[0] ?? null,
        vertical:
          parseMultipleValues(getValue(borderBottomLeftRadius[0]))?.[1] ?? null,
      }
    }
    if (style.borderBottomRightRadius !== '') {
      const borderBottomRightRadius: any = parse(style.borderBottomRightRadius)
      parsedStyle.borderRadius.bottomRight = {
        horizontal:
          parseMultipleValues(getValue(borderBottomRightRadius[0]))?.[0] ??
          null,
        vertical:
          parseMultipleValues(getValue(borderBottomRightRadius[0]))?.[1] ??
          null,
      }
    }
  } else {
    parsedStyle.borderRadius = null
  }

  // Font
  if (
    args.style['font-family'] ||
    args.style['font-size'] ||
    args.style['font-stretch'] ||
    args.style['font-style'] ||
    args.style['font-variant'] ||
    args.style['font-weight'] ||
    args.style['line-height'] ||
    args.style.font
  ) {
    parsedStyle.font = {
      family: null,
      size: null,
      stretch: null,
      style: null,
      variant: null,
      weight: null,
      lineHeight: null,
    }
    if (args.style.font) {
      const parsedFont: any = parse(args.style.font, false)

      let sizeSet = false

      // Go through all the values in the font property
      parsedFont.forEach((pf: any, index: number) => {
        if (pf.nodes.length === 1 && pf.nodes[0].value === 'inherit') {
          parsedStyle.font = {
            family: [{ type: 'keyword', value: 'inherit' }],
            size: { type: 'keyword', value: 'inherit' },
            stretch: { type: 'keyword', value: 'inherit' },
            style: { style: { type: 'keyword', value: 'inherit' } },
            variant: { type: 'keyword', value: 'inherit' },
            weight: { type: 'keyword', value: 'inherit' },
            lineHeight: { type: 'keyword', value: 'inherit' },
          }
        } else {
          pf.nodes.forEach((property: any) => {
            const propValue = getValue(property)
            const valueToCheck = parseMultipleValues([propValue])[0]
            const newProp = parseFont(valueToCheck, sizeSet)

            if (newProp.style) {
              if (!parsedStyle.font.style) {
                parsedStyle.font.style = { style: null, angle: null }
              }
              parsedStyle.font.style.style = newProp.style
            } else if (newProp.styleAngle) {
              if (!parsedStyle.font.style) {
                parsedStyle.font.style = { style: null, angle: null }
              }
              parsedStyle.font.style.angle = newProp.styleAngle
            } else if (newProp.variant) {
              parsedStyle.font.variant = newProp.variant
            } else if (newProp.weight) {
              parsedStyle.font.weight = newProp.weight
            } else if (newProp.stretch) {
              parsedStyle.font.stretch = newProp.stretch
            } else if (newProp.size) {
              parsedStyle.font.size = newProp.size
            } else if (newProp.lineHeight) {
              parsedStyle.font.lineHeight = newProp.lineHeight
            } else if (newProp.family) {
              if (!parsedStyle.font.family) {
                parsedStyle.font.family = [newProp.family]
              } else {
                if (parsedStyle.font.family[index]) {
                  parsedStyle.font.family[index] = {
                    type: 'string',
                    value: `${parsedStyle.font.family[index].value} ${newProp.family.value}`,
                  }
                } else {
                  parsedStyle.font.family[index] = newProp.family
                }
              }
            }
            sizeSet = newProp.sizeSet
          })
        }
      })
    }
    if (
      args.style['font-family'] &&
      (styleKeys.indexOf('font-family') > styleKeys.indexOf('font') ||
        !parsedStyle.font.family)
    ) {
      const fontFamily: any = parse(args.style['font-family'])
      fontFamily.forEach((family: any, index: number) => {
        const parsedFamily = parseMultipleValues(getValue(family)) ?? []

        let fam: any = {
          type: 'keyword',
        }
        if (parsedFamily.length > 1) {
          fam.type = 'string'
          parsedFamily.forEach((f: any) => {
            fam.value = fam.value ? `${fam.value} ${f.value}` : `${f.value}`
          })
        } else {
          fam = parsedFamily?.[0] ?? null
        }

        if (!parsedStyle.font.family) {
          parsedStyle.font.family = [fam]
        } else {
          parsedStyle.font.family[index] = fam
        }
      })
    }
    if (
      args.style['font-size'] &&
      (styleKeys.indexOf('font-size') > styleKeys.indexOf('font') ||
        !parsedStyle.font.size)
    ) {
      const fontSize: any = parse(args.style['font-size'])
      parsedStyle.font.size =
        parseMultipleValues(getValue(fontSize[0]))?.[0] ?? null
    }

    const familyAndSizeSet = parsedStyle.font.family && parsedStyle.font.size

    if (
      args.style['font-stretch'] &&
      (styleKeys.indexOf('font-stretch') > styleKeys.indexOf('font') ||
        !parsedStyle.font.stretch ||
        !familyAndSizeSet)
    ) {
      const fontStretch: any = parse(args.style['font-stretch'])
      parsedStyle.font.stretch =
        parseMultipleValues(getValue(fontStretch[0]))?.[0] ?? null
    }
    if (
      args.style['font-style'] &&
      (styleKeys.indexOf('font-style') > styleKeys.indexOf('font') ||
        !parsedStyle.font.style ||
        !familyAndSizeSet)
    ) {
      const fontStyle: any = parse(args.style['font-style'])
      parsedStyle.font.style = args.style['font-style']
        ? {
            style: parseMultipleValues(getValue(fontStyle[0]))?.[0] ?? null,
            angle: parseMultipleValues(getValue(fontStyle[0]))?.[1] ?? null,
          }
        : null
    }
    if (
      args.style['font-weight'] &&
      (styleKeys.indexOf('font-weight') > styleKeys.indexOf('font') ||
        !parsedStyle.font.weight ||
        !familyAndSizeSet)
    ) {
      const fontWeight: any = parse(args.style['font-weight'])
      parsedStyle.font.weight =
        parseMultipleValues(getValue(fontWeight[0]))?.[0] ?? null
    }
    if (
      args.style['line-height'] &&
      (styleKeys.indexOf('line-height') > styleKeys.indexOf('font') ||
        !parsedStyle.font.lineHeight ||
        !familyAndSizeSet)
    ) {
      const lineHeight: any = parse(args.style['line-height'])
      parsedStyle.font.lineHeight =
        parseMultipleValues(getValue(lineHeight[0]))?.[0] ?? null
    }
  } else {
    parsedStyle.font = null
  }

  // Outline
  if (
    args.style['outline-color'] ||
    args.style['outline-style'] ||
    args.style['outline-width'] ||
    args.style.outline
  ) {
    parsedStyle.outline = {
      width: null,
      style: null,
      color: null,
    }
    const invalidValues: any[] = []
    const shorthandOutline = {
      width: null,
      style: null,
      color: null,
    }

    if (args.style.outline) {
      const outline: any = parse(args.style.outline)

      const values = getValue(outline[0])
      const allValues = parseMultipleValues(values)

      const allVariablesKnown = checkIfNoUnknownVariables(allValues)

      if (allVariablesKnown) {
        // Go through all the values in the outline property
        allValues.forEach((val: any) => {
          const newProp = parseBorderOrOutline(val, 'outline')
          if (newProp.invalidValue) {
            invalidValues.push(val)
          } else if (newProp.width) {
            shorthandOutline.width = newProp.width
          } else if (newProp.style) {
            shorthandOutline.style = newProp.style
          } else if (newProp.color) {
            shorthandOutline.color = newProp.color
          }
        })

        // We apply only if no invalid values
        if (invalidValues.length === 0) {
          parsedStyle.outline = shorthandOutline
        }
      } else {
        // Parse the values by the order
        parsedStyle.outline = {
          width: allValues[0],
          style: allValues[1],
          color: allValues[2],
        }
      }
    }
    if (
      args.style['outline-color'] &&
      (styleKeys.indexOf('outline-color') > styleKeys.indexOf('outline') ||
        invalidValues.length > 0)
    ) {
      const outlineColor: any = parse(args.style['outline-color'])
      const parsedOutlineColor = parseMultipleValues(
        getValue(outlineColor[0]),
      )?.[0]

      // If it's a variable we always return that
      if (
        (parsedOutlineColor.type === 'function' &&
          parsedOutlineColor.name === 'var') ||
        !args.style.outline
      ) {
        parsedStyle.outline.color = parsedOutlineColor
      } else {
        // Check if it's a valid value
        const newProp = parseBorderOrOutline(parsedOutlineColor, 'outline')
        if (newProp.color) {
          parsedStyle.outline.color = newProp.color
        }
      }
    }
    if (
      args.style['outline-style'] &&
      (styleKeys.indexOf('outline-style') > styleKeys.indexOf('outline') ||
        invalidValues.length > 0)
    ) {
      const outlineStyle: any = parse(args.style['outline-style'])
      const parsedOutlineStyle = parseMultipleValues(
        getValue(outlineStyle[0]),
      )?.[0]

      // If it's a variable we always return that
      if (
        (parsedOutlineStyle.type === 'function' &&
          parsedOutlineStyle.name === 'var') ||
        !args.style.outline
      ) {
        parsedStyle.outline.style = parsedOutlineStyle
      } else {
        // Check if it's a valid value
        const newProp = parseBorderOrOutline(parsedOutlineStyle, 'outline')
        if (newProp.style) {
          parsedStyle.outline.style = newProp.style
        }
      }
    }
    if (
      args.style['outline-width'] &&
      (styleKeys.indexOf('outline-width') > styleKeys.indexOf('outline') ||
        invalidValues.length > 0)
    ) {
      const outlineWidth: any = parse(args.style['outline-width'])
      const parsedOutlineWidth = parseMultipleValues(
        getValue(outlineWidth[0]),
      )?.[0]

      // If it's a variable we always return that
      if (
        (parsedOutlineWidth.type === 'function' &&
          parsedOutlineWidth.name === 'var') ||
        !args.style.outline
      ) {
        parsedStyle.outline.width = parsedOutlineWidth
      } else {
        // Check if it's a valid value
        const newProp = parseBorderOrOutline(parsedOutlineWidth, 'outline')
        if (newProp.width) {
          parsedStyle.outline.width = newProp.width
        }
      }
    }
    // We also want to apply if the shorthand has invalid values and there are no any single properties defined
    if (
      invalidValues.length > 0 &&
      Object.values(parsedStyle.outline).every((val) => !val)
    ) {
      parsedStyle.outline = shorthandOutline
      Object.entries(parsedStyle.outline).forEach(([key, value]) => {
        if (!value) {
          parsedStyle.outline[key] = invalidValues[0]
          invalidValues.shift()
        }
      })
    }
  } else {
    parsedStyle.outline = null
  }

  // Flex
  if (
    args.style['flex-grow'] ||
    args.style['flex-shrink'] ||
    args.style['flex-basis'] ||
    args.style.flex
  ) {
    parsedStyle.flex = {
      grow: null,
      shrink: null,
      basis: null,
    }

    if (args.style.flex) {
      if (args.style.flex === 'none') {
        parsedStyle.flex = {
          grow: { type: 'number', value: '0' },
          shrink: { type: 'number', value: '0' },
          basis: { type: 'keyword', value: 'auto' },
        }
      } else if (args.style.flex === 'auto') {
        parsedStyle.flex = {
          grow: { type: 'number', value: '1' },
          shrink: { type: 'number', value: '1' },
          basis: { type: 'keyword', value: 'auto' },
        }
      } else if (args.style.flex === 'initial') {
        parsedStyle.flex = {
          grow: { type: 'number', value: '0' },
          shrink: { type: 'number', value: '1' },
          basis: { type: 'keyword', value: 'auto' },
        }
      } else {
        const flex: any = parse(args.style.flex)

        // Go through all the values in the flex property
        flex[0].nodes.forEach((property: any) => {
          const propValue = getValue(property)
          const valueToCheck = parseMultipleValues([propValue])[0]
          const newProp = parseFlex(parsedStyle.flex, valueToCheck)
          if (newProp.grow) {
            parsedStyle.flex.grow = newProp.grow
          } else if (newProp.shrink) {
            parsedStyle.flex.shrink = newProp.shrink
          } else if (newProp.basis) {
            parsedStyle.flex.basis = newProp.basis
          }
        })
      }
    }
    if (
      args.style['flex-grow'] &&
      styleKeys.indexOf('flex-grow') > styleKeys.indexOf('flex')
    ) {
      const flexGrow: any = parse(args.style['flex-grow'])
      parsedStyle.flex.grow =
        parseMultipleValues(getValue(flexGrow[0]))?.[0] ?? null
    }
    if (
      args.style['flex-shrink'] &&
      styleKeys.indexOf('flex-shrink') > styleKeys.indexOf('flex')
    ) {
      const flexShrink: any = parse(args.style['flex-shrink'])
      parsedStyle.flex.shrink =
        parseMultipleValues(getValue(flexShrink[0]))?.[0] ?? null
    }
    if (
      args.style['flex-basis'] &&
      styleKeys.indexOf('flex-basis') > styleKeys.indexOf('flex')
    ) {
      const flexBasis: any = parse(args.style['flex-basis'])
      parsedStyle.flex.basis =
        parseMultipleValues(getValue(flexBasis[0]))?.[0] ?? null
    }
  } else {
    parsedStyle.flex = null
  }

  // Text decoration
  if (
    args.style['text-decoration-line'] ||
    args.style['text-decoration-style'] ||
    args.style['text-decoration-color'] ||
    args.style['text-decoration-thickness'] ||
    args.style['text-decoration']
  ) {
    parsedStyle.textDecoration = {
      line: null,
      style: null,
      color: null,
      thickness: null,
    }

    if (args.style['text-decoration']) {
      const textDecoration: any = parse(args.style['text-decoration'])

      // Go through all the values in the text-decoration property
      textDecoration[0].nodes.forEach((property: any) => {
        const propValue = getValue(property)
        const valueToCheck = parseMultipleValues([propValue])[0]
        const newProp = parseDecoration(valueToCheck)
        if (newProp.line) {
          if (parsedStyle.textDecoration.line) {
            parsedStyle.textDecoration.line.push(newProp.line)
          } else {
            parsedStyle.textDecoration.line = [newProp.line]
          }
        } else if (newProp.style) {
          parsedStyle.textDecoration.style = newProp.style
        } else if (newProp.color) {
          parsedStyle.textDecoration.color = newProp.color
        } else if (newProp.thickness) {
          parsedStyle.textDecoration.thickness = newProp.thickness
        }
      })
    }
    if (
      args.style['text-decoration-line'] &&
      (styleKeys.indexOf('text-decoration-line') >
        styleKeys.indexOf('text-decoration') ||
        !parsedStyle.textDecoration.line)
    ) {
      const textDecorationLine: any = parse(args.style['text-decoration-line'])
      parsedStyle.textDecoration.line = textDecorationLine.map(
        (line: any) => parseMultipleValues(getValue(line))?.[0] ?? null,
      )
    }
    if (
      args.style['text-decoration-style'] &&
      (styleKeys.indexOf('text-decoration-style') >
        styleKeys.indexOf('text-decoration') ||
        !parsedStyle.textDecoration.style)
    ) {
      const textDecorationStyle: any = parse(
        args.style['text-decoration-style'],
      )
      parsedStyle.textDecoration.style =
        parseMultipleValues(getValue(textDecorationStyle[0]))?.[0] ?? null
    }
    if (
      args.style['text-decoration-color'] &&
      (styleKeys.indexOf('text-decoration-color') >
        styleKeys.indexOf('text-decoration') ||
        !parsedStyle.textDecoration.color)
    ) {
      const textDecorationColor: any = parse(
        args.style['text-decoration-color'],
      )
      parsedStyle.textDecoration.color =
        parseMultipleValues(getValue(textDecorationColor[0]))?.[0] ?? null
    }
    if (
      args.style['text-decoration-thickness'] &&
      (styleKeys.indexOf('text-decoration-thickness') >
        styleKeys.indexOf('text-decoration') ||
        !parsedStyle.textDecoration.thickness)
    ) {
      const textDecorationThickness: any = parse(
        args.style['text-decoration-thickness'],
      )
      parsedStyle.textDecoration.thickness =
        parseMultipleValues(getValue(textDecorationThickness[0]))?.[0] ?? null
    }
  } else {
    parsedStyle.textDecoration = null
  }

  if (args.style['color']) {
    const color: any = parse(args.style['color'])
    parsedStyle.color = parseMultipleValues(getValue(color[0]))?.[0] ?? null
  } else {
    parsedStyle.color = null
  }

  return parsedStyle
}

const parse = parser()

function parser() {
  var openParentheses = '('.charCodeAt(0)
  var closeParentheses = ')'.charCodeAt(0)
  var singleQuote = "'".charCodeAt(0)
  var doubleQuote = '"'.charCodeAt(0)
  var backslash = '\\'.charCodeAt(0)
  var slash = '/'.charCodeAt(0)
  var comma = ','.charCodeAt(0)
  var colon = ':'.charCodeAt(0)
  var star = '*'.charCodeAt(0)
  var uLower = 'u'.charCodeAt(0)
  var uUpper = 'U'.charCodeAt(0)
  var plus = '+'.charCodeAt(0)
  var isUnicodeRange = /^[a-f0-9?-]+$/i
  return function (input?: any, slashSplit: boolean = true) {
    if (input === undefined || input == null) {
      return null
    }
    var tokens: any = []
    var value = `${input}`
    var next: any
    var quote: any
    var prev: any
    var token: any
    var escape: any
    var escapePos: any
    var whitespacePos: any
    var parenthesesOpenPos: any
    var pos = 0
    var code = value.charCodeAt(pos)
    var max = value.length
    var stack: any[] = [{ nodes: tokens }]
    var balanced = 0
    var parent
    var name = ''
    while (pos < max) {
      if (code <= 32) {
        next = pos
        do {
          next += 1
          code = value.charCodeAt(next)
        } while (code <= 32)
        token = value.slice(pos, next)
        prev = tokens[tokens.length - 1]
        pos = next
      } else if (code === singleQuote || code === doubleQuote) {
        next = pos
        quote = code === singleQuote ? "'" : '"'
        token = {
          type: 'string',
          quote,
        }
        do {
          escape = false
          next = value.indexOf(quote, next + 1)
          if (~next) {
            escapePos = next
            while (value.charCodeAt(escapePos - 1) === backslash) {
              escapePos -= 1
              escape = !escape
            }
          } else {
            value += quote
            next = value.length - 1
            token.unclosed = true
          }
        } while (escape)
        token.value = value.slice(pos + 1, next)
        tokens.push(token)
        pos = next + 1
        code = value.charCodeAt(pos)
      } else if (code === slash && value.charCodeAt(pos + 1) === star) {
        next = value.indexOf('*/', pos)
        token = {
          type: 'comment',
        }
        if (next === -1) {
          token.unclosed = true
          next = value.length
        }
        token.value = value.slice(pos + 2, next)
        tokens.push(token)
        pos = next + 2
        code = value.charCodeAt(pos)
      } else if (
        (code === slash || code === star) &&
        parent &&
        parent.type === 'function' &&
        parent.value === 'calc'
      ) {
        token = value[pos]
        tokens.push({
          type: 'word',
          value: token,
        })
        pos += 1
        code = value.charCodeAt(pos)
      } else if (code === slash || code === comma || code === colon) {
        token = value[pos]
        if (parent?.type !== 'function') {
          tokens.push({
            type: 'div',
            value: token,
          })
        }
        pos += 1
        code = value.charCodeAt(pos)
      } else if (openParentheses === code) {
        next = pos
        do {
          next += 1
          code = value.charCodeAt(next)
        } while (code <= 32)
        parenthesesOpenPos = pos
        token = {
          type: 'function',
          value: name,
        }
        pos = next
        if (name === 'url' && code !== singleQuote && code !== doubleQuote) {
          next -= 1
          do {
            escape = false
            next = value.indexOf(')', next + 1)
            if (~next) {
              escapePos = next
              while (value.charCodeAt(escapePos - 1) === backslash) {
                escapePos -= 1
                escape = !escape
              }
            } else {
              value += ')'
              next = value.length - 1
              token.unclosed = true
            }
          } while (escape)
          whitespacePos = next
          do {
            whitespacePos -= 1
            code = value.charCodeAt(whitespacePos)
          } while (code <= 32)
          if (parenthesesOpenPos < whitespacePos) {
            if (pos !== whitespacePos + 1) {
              token.nodes = [
                {
                  type: 'word',
                  value: value.slice(pos, whitespacePos + 1),
                },
              ]
            } else {
              token.nodes = []
            }
          } else {
            token.nodes = []
          }
          pos = next + 1
          code = value.charCodeAt(pos)
          tokens.push(token)
        } else {
          balanced += 1
          tokens.push(token)
          stack.push(token)
          tokens = token.nodes = []
          parent = token
        }
        name = ''
      } else if (closeParentheses === code && balanced) {
        pos += 1
        code = value.charCodeAt(pos)
        balanced -= 1
        stack.pop()
        parent = stack[balanced]
        tokens = parent.nodes
      } else {
        next = pos
        do {
          if (code === backslash) {
            next += 1
          }
          next += 1
          code = value.charCodeAt(next)
        } while (
          next < max &&
          !(
            code <= 32 ||
            code === singleQuote ||
            code === doubleQuote ||
            code === comma ||
            code === colon ||
            code === slash ||
            code === openParentheses ||
            (code === star &&
              parent &&
              parent.type === 'function' &&
              parent.value === 'calc') ||
            (code === slash &&
              parent.type === 'function' &&
              parent.value === 'calc') ||
            (code === closeParentheses && balanced)
          )
        )
        token = value.slice(pos, next)

        if (openParentheses === code) {
          name = token
        } else if (
          (uLower === token.charCodeAt(0) || uUpper === token.charCodeAt(0)) &&
          plus === token.charCodeAt(1) &&
          isUnicodeRange.test(token.slice(2))
        ) {
          tokens.push({
            type: 'unicode-range',
            value: token,
          })
        } else {
          tokens.push({
            type: 'word',
            value: token.trim(),
          })
        }
        pos = next
      }
    }

    for (pos = stack.length - 1; pos; pos -= 1) {
      stack[pos].unclosed = true
    }
    const results: any[] = [{ type: 'block', nodes: [] }]
    let resultIndex = 0
    for (const node of stack[0].nodes) {
      if (
        (node.type === 'div' && node.value !== '/') ||
        (node.type === 'div' && node.value === '/' && slashSplit)
      ) {
        resultIndex++
        results[resultIndex] = { type: 'block', nodes: [] }
        continue
      }
      results[resultIndex].nodes.push(node)
    }
    return results
  }
}
