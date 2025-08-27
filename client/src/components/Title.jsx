import React from 'react'

const Title = (props) => {
  return (
    <h1 className='font-medium text-2xl'>
      {props.text1}
      <span className='underline text-primary'>
        {props.text2}
      </span>
    </h1>
  )
}

export default Title
