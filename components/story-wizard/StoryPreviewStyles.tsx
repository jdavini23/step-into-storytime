/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

export const storyPreviewStyles = {
  container: css`
    position: relative;
    background: white;
    border-radius: 12px 24px 24px 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
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
    font-size: 0.875rem;
    color: #64748b;
  `,

  content: css`
    font-family: var(--font-sans);
    max-width: 65ch;
    margin: 0 auto;
    color: #4a5568;
    padding: 2rem;
    min-height: 60vh;
    position: relative;
    display: flex;
    flex-direction: column;
  `,

  paragraph: css`
    font-size: 1.125rem;
    line-height: 1.8;
    margin: 1.25rem 0;
    text-indent: 2rem;
    color: #4a5568;
    letter-spacing: 0.01em;

    &:first-of-type {
      text-indent: 0;
      font-size: 1.25rem;
      line-height: 1.7;

      &::first-letter {
        font-size: 3.25rem;
        font-family: var(--font-display);
        float: left;
        line-height: 1;
        padding: 0.1em 0.1em 0 0;
      }
    }
  `,

  pageNavigation: css`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: auto;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
  `,

  controls: css`
    display: flex;
    align-items: center;
    gap: 0.5rem;
  `,

  tabButton: (isActive: boolean, primaryColor: string) => css`
    background: ${isActive ? `${primaryColor}10` : 'transparent'};
    border-color: ${isActive ? `${primaryColor}30` : '#e2e8f0'};
    color: ${isActive ? primaryColor : '#64748b'};
    
    &:hover {
      background: ${`${primaryColor}20`};
    }
  `,

  tooltip: css`
    position: absolute;
    background: white;
    padding: 0.5rem;
    border-radius: 0.375rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    z-index: 50;
    font-size: 0.75rem;
  `
};
