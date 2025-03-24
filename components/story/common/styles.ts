/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

export const storyStyles = {
  container: css`
    position: relative;
    background: white;
    border-radius: 12px 24px 24px 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
      0 8px 10px -6px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    overflow: hidden;
    min-height: 400px;
    background: linear-gradient(to right, #f9f9f9, #ffffff);
  `,

  header: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: white;
    border-bottom: 1px solid #e2e8f0;
  `,

  headerLeft: css`
    display: flex;
    align-items: center;
    gap: 1rem;
  `,

  headerInfo: css`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  `,

  title: css`
    font-family: var(--font-display);
    font-size: 2rem;
    line-height: 1.2;
    margin: 2rem 0;
    text-align: center;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  `,

  metadata: css`
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #64748b;
    font-size: 0.875rem;
  `,

  controls: css`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
  `,
};
