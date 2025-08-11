import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeToggle } from '../theme-toggle';
import { ThemeProvider } from '../theme-provider';

describe('ThemeToggle', () => {
  it('renders theme toggle button', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const themeButton = screen.getByRole('button');
    expect(themeButton).toBeInTheDocument();
  });
});
