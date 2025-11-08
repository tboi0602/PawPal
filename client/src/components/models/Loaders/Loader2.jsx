import styled from "styled-components";

export const Loader2 = () => {
  return (
    <StyledWrapper>
      <div className="wrapper">
        <div className="circle" />
        <div className="circle" />
        <div className="circle" />
        <div className="shadow" />
        <div className="shadow" />
        <div className="shadow" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .wrapper {
    width: 100px;
    height: 30px;
    position: relative;
    z-index: 1;
  }

  .circle {
    width: 10px;
    height: 10px;
    position: absolute;
    border-radius: 50%;
    background-color: #fff;
    left: 15%;
    transform-origin: 50%;
    animation: circle7124 0.5s alternate infinite ease;
  }

  @keyframes circle7124 {
    0% {
      top: 20px;
      transform: scaleX(2);
    }

    40% {
      transform: scaleX(1);
    }

    100% {
      top: 0%;
    }
  }

  .circle:nth-child(2) {
    left: 45%;
    animation-delay: 0.2s;
  }

  .circle:nth-child(3) {
    left: auto;
    right: 15%;
    animation-delay: 0.3s;
  }
`;
